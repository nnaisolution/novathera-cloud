-- Sequences for race-safe booking/employee codes
CREATE SEQUENCE IF NOT EXISTS booking_code_seq START 1;
CREATE SEQUENCE IF NOT EXISTS employee_code_seq START 1;

-- Prevent overlapping active bookings for the same employee
-- (startTime/endTime are timestamp without time zone in this schema)
CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE OR REPLACE FUNCTION booking_tsrange(start_t timestamp, end_t timestamp)
RETURNS tsrange
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
AS $$
  SELECT tsrange(start_t, end_t, '[)');
$$;

ALTER TABLE "booking" DROP CONSTRAINT IF EXISTS booking_no_overlap;
ALTER TABLE "booking" ADD CONSTRAINT booking_no_overlap
  EXCLUDE USING gist (
    "employeeId" WITH =,
    booking_tsrange("startTime", "endTime") WITH &&
  )
  WHERE ("deletedAt" IS NULL AND "cancelledAt" IS NULL);
