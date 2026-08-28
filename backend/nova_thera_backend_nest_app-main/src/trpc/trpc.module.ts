import { Module } from '@nestjs/common';
import { AuthService } from '@thallesp/nestjs-better-auth';
import type { AuthInstance } from '../authentication/auth.factory';
import { LocationsModule } from '../models/locations/locations.module';
import { LocationsService } from '../models/locations/locations.service';
import { EmployeesModule } from '../models/employees/employees.module';
import { EmployeesService } from '../models/employees/employees.service';
import { ServiceCategoriesModule } from '../models/service-categories/service-categories.module';
import { ServiceCategoriesService } from '../models/service-categories/service-categories.service';
import { ServicesModule } from '../models/services/services.module';
import { ServicesService } from '../models/services/services.service';
import { PackagesModule } from '../models/packages/packages.module';
import { PackagesService } from '../models/packages/packages.service';
import { BookingsModule } from '../models/bookings/bookings.module';
import { BookingsService } from '../models/bookings/bookings.service';
import { BrandsModule } from '../models/brands/brands.module';
import { BrandsService } from '../models/brands/brands.service';
import { ProductsModule } from '../models/products/products.module';
import { ProductsService } from '../models/products/products.service';
import { CartModule } from '../models/cart/cart.module';
import { CartService } from '../models/cart/cart.service';
import { CheckoutModule } from '../models/checkout/checkout.module';
import { CheckoutService } from '../models/checkout/checkout.service';
import { OrdersModule } from '../models/orders/orders.module';
import { OrdersService } from '../models/orders/orders.service';
import { DiscountsModule } from '../models/discounts/discounts.module';
import { DiscountsService } from '../models/discounts/discounts.service';
import { ShippingTiersModule } from '../models/shipping-tiers/shipping-tiers.module';
import { ShippingTiersService } from '../models/shipping-tiers/shipping-tiers.service';
import { FamilyMembersModule } from '../models/family-members/family-members.module';
import { FamilyMembersService } from '../models/family-members/family-members.service';
import { DocumentsModule } from '../models/documents/documents.module';
import { DocumentsService } from '../models/documents/documents.service';
import { PaymentMethodsModule } from '../models/payment-methods/payment-methods.module';
import { PaymentMethodsService } from '../models/payment-methods/payment-methods.service';
import { MembershipModule } from '../models/membership/membership.module';
import { MembershipService } from '../models/membership/membership.service';
import { AnalyticsModule } from '../models/analytics/analytics.module';
import { SettingsModule } from '../models/settings/settings.module';
import { SettingsService } from '../models/settings/settings.service';
import { StaffModule } from '../models/staff/staff.module';
import { StaffService } from '../models/staff/staff.service';
import { StorageModule } from '../models/storage/storage.module';
import { StorageService } from '../models/storage/storage.service';
import { NotificationsModule } from '../models/notifications/notifications.module';
import { NotificationsService } from '../models/notifications/notifications.service';
import { AuditModule } from '../models/audit/audit.module';
import { AuditService } from '../models/audit/audit.service';
import { AnalyticsService } from '../models/analytics/analytics.service';
import { createAppRouter } from './app.router';
import { createTrpcContextFactory } from './context';

export const TRPC_ROUTER = Symbol('TRPC_ROUTER');
export const TRPC_CONTEXT_FACTORY = Symbol('TRPC_CONTEXT_FACTORY');

@Module({
  imports: [
    LocationsModule,
    EmployeesModule,
    ServiceCategoriesModule,
    ServicesModule,
    PackagesModule,
    BookingsModule,
    BrandsModule,
    ProductsModule,
    CartModule,
    CheckoutModule,
    OrdersModule,
    DiscountsModule,
    ShippingTiersModule,
    FamilyMembersModule,
    DocumentsModule,
    PaymentMethodsModule,
    MembershipModule,
    AnalyticsModule,
    SettingsModule,
    StaffModule,
    AuditModule,
    StorageModule,
    NotificationsModule,
  ],
  providers: [
    {
      provide: TRPC_ROUTER,
      inject: [
        LocationsService,
        EmployeesService,
        ServiceCategoriesService,
        ServicesService,
        PackagesService,
        BookingsService,
        BrandsService,
        ProductsService,
        CartService,
        CheckoutService,
        OrdersService,
        DiscountsService,
        ShippingTiersService,
        FamilyMembersService,
        DocumentsService,
        PaymentMethodsService,
        MembershipService,
        AnalyticsService,
        SettingsService,
        StaffService,
        AuditService,
        StorageService,
        NotificationsService,
      ],
      useFactory: (
        locationsService: LocationsService,
        employeesService: EmployeesService,
        serviceCategoriesService: ServiceCategoriesService,
        servicesService: ServicesService,
        packagesService: PackagesService,
        bookingsService: BookingsService,
        brandsService: BrandsService,
        productsService: ProductsService,
        cartService: CartService,
        checkoutService: CheckoutService,
        ordersService: OrdersService,
        discountsService: DiscountsService,
        shippingTiersService: ShippingTiersService,
        familyMembersService: FamilyMembersService,
        documentsService: DocumentsService,
        paymentMethodsService: PaymentMethodsService,
        membershipService: MembershipService,
        analyticsService: AnalyticsService,
        settingsService: SettingsService,
        staffService: StaffService,
        auditService: AuditService,
        storageService: StorageService,
        notificationsService: NotificationsService,
      ) =>
        createAppRouter({
          locationsService,
          employeesService,
          serviceCategoriesService,
          servicesService,
          packagesService,
          bookingsService,
          brandsService,
          productsService,
          cartService,
          checkoutService,
          ordersService,
          discountsService,
          shippingTiersService,
          familyMembersService,
          documentsService,
          paymentMethodsService,
          membershipService,
          analyticsService,
          settingsService,
          staffService,
          auditService,
          storageService,
          notificationsService,
        }),
    },
    {
      provide: TRPC_CONTEXT_FACTORY,
      inject: [AuthService],
      useFactory: (authService: AuthService<AuthInstance>) =>
        createTrpcContextFactory(authService),
    },
  ],
  exports: [TRPC_ROUTER, TRPC_CONTEXT_FACTORY],
})
export class TrpcModule {}
