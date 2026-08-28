import { router } from './trpc';
import { createLocationsRouter } from '../models/locations/locations.router';
import { createEmployeesRouter } from '../models/employees/employees.router';
import { createServiceCategoriesRouter } from '../models/service-categories/service-categories.router';
import { createServicesRouter } from '../models/services/services.router';
import { createPackagesRouter } from '../models/packages/packages.router';
import { createBookingsRouter } from '../models/bookings/bookings.router';
import { createBrandsRouter } from '../models/brands/brands.router';
import { createProductsRouter } from '../models/products/products.router';
import { createCartRouter } from '../models/cart/cart.router';
import { createCheckoutRouter } from '../models/checkout/checkout.router';
import { createOrdersRouter } from '../models/orders/orders.router';
import { createDiscountsRouter } from '../models/discounts/discounts.router';
import { createShippingTiersRouter } from '../models/shipping-tiers/shipping-tiers.router';
import { createFamilyMembersRouter } from '../models/family-members/family-members.router';
import { createDocumentsRouter } from '../models/documents/documents.router';
import { createPaymentMethodsRouter } from '../models/payment-methods/payment-methods.router';
import { createMembershipRouter } from '../models/membership/membership.router';
import { createAnalyticsRouter } from '../models/analytics/analytics.router';
import { createSettingsRouter } from '../models/settings/settings.router';
import { createStaffRouter } from '../models/staff/staff.router';
import { createAuditRouter } from '../models/audit/audit.router';
import { createStorageRouter } from '../models/storage/storage.router';
import { createNotificationsRouter } from '../models/notifications/notifications.router';
import { LocationsService } from '../models/locations/locations.service';
import { EmployeesService } from '../models/employees/employees.service';
import { ServiceCategoriesService } from '../models/service-categories/service-categories.service';
import { ServicesService } from '../models/services/services.service';
import { PackagesService } from '../models/packages/packages.service';
import { BookingsService } from '../models/bookings/bookings.service';
import { BrandsService } from '../models/brands/brands.service';
import { ProductsService } from '../models/products/products.service';
import { CartService } from '../models/cart/cart.service';
import { CheckoutService } from '../models/checkout/checkout.service';
import { OrdersService } from '../models/orders/orders.service';
import { DiscountsService } from '../models/discounts/discounts.service';
import { ShippingTiersService } from '../models/shipping-tiers/shipping-tiers.service';
import { FamilyMembersService } from '../models/family-members/family-members.service';
import { DocumentsService } from '../models/documents/documents.service';
import { PaymentMethodsService } from '../models/payment-methods/payment-methods.service';
import { MembershipService } from '../models/membership/membership.service';
import { AnalyticsService } from '../models/analytics/analytics.service';
import { SettingsService } from '../models/settings/settings.service';
import { StaffService } from '../models/staff/staff.service';
import { AuditService } from '../models/audit/audit.service';
import { StorageService } from '../models/storage/storage.service';
import { NotificationsService } from '../models/notifications/notifications.service';

export function createAppRouter(deps: {
  locationsService: LocationsService;
  employeesService: EmployeesService;
  serviceCategoriesService: ServiceCategoriesService;
  servicesService: ServicesService;
  packagesService: PackagesService;
  bookingsService: BookingsService;
  brandsService: BrandsService;
  productsService: ProductsService;
  cartService: CartService;
  checkoutService: CheckoutService;
  ordersService: OrdersService;
  discountsService: DiscountsService;
  shippingTiersService: ShippingTiersService;
  familyMembersService: FamilyMembersService;
  documentsService: DocumentsService;
  paymentMethodsService: PaymentMethodsService;
  membershipService: MembershipService;
  analyticsService: AnalyticsService;
  settingsService: SettingsService;
  staffService: StaffService;
  auditService: AuditService;
  storageService: StorageService;
  notificationsService: NotificationsService;
}) {
  return router({
    locations: createLocationsRouter(deps.locationsService),
    employees: createEmployeesRouter(deps.employeesService),
    serviceCategories: createServiceCategoriesRouter(
      deps.serviceCategoriesService,
    ),
    services: createServicesRouter(deps.servicesService),
    packages: createPackagesRouter(deps.packagesService),
    bookings: createBookingsRouter(deps.bookingsService),
    brands: createBrandsRouter(deps.brandsService),
    products: createProductsRouter(deps.productsService),
    cart: createCartRouter(deps.cartService),
    checkout: createCheckoutRouter(deps.checkoutService),
    orders: createOrdersRouter(deps.ordersService),
    discounts: createDiscountsRouter(deps.discountsService),
    shippingTiers: createShippingTiersRouter(deps.shippingTiersService),
    familyMembers: createFamilyMembersRouter(deps.familyMembersService),
    documents: createDocumentsRouter(deps.documentsService),
    paymentMethods: createPaymentMethodsRouter(deps.paymentMethodsService),
    membership: createMembershipRouter(deps.membershipService),
    analytics: createAnalyticsRouter(deps.analyticsService),
    settings: createSettingsRouter(deps.settingsService, deps.auditService),
    staff: createStaffRouter(deps.staffService, deps.auditService),
    audit: createAuditRouter(deps.auditService),
    storage: createStorageRouter(deps.storageService),
    notifications: createNotificationsRouter(deps.notificationsService),
  });
}

export type AppRouter = ReturnType<typeof createAppRouter>;
