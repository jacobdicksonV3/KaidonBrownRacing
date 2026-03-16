import { Private, Router, Route, Set } from '@cedarjs/router'

import SiteLayout from 'src/layouts/SiteLayout/SiteLayout'
import AdminLayout from 'src/layouts/AdminLayout/AdminLayout'

import { useAuth } from './auth.js'

const Routes = () => {
  return (
    <Router useAuth={useAuth}>
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />

      <Private unauthenticated="login" roles="admin" wrap={AdminLayout}>
        <Route path="/admin" page={AdminDashboardPage} name="adminDashboard" />
        <Route path="/admin/orders" page={AdminOrdersPage} name="adminOrders" />
        <Route path="/admin/orders/{id:Int}" page={AdminOrderDetailPage} name="adminOrderDetail" />
        <Route path="/admin/products" page={AdminProductsPage} name="adminProducts" />
        <Route path="/admin/products/new" page={AdminProductNewPage} name="adminProductNew" />
        <Route path="/admin/products/{id:Int}/edit" page={AdminProductEditPage} name="adminProductEdit" />
        <Route path="/admin/messages" page={AdminContactMessagesPage} name="adminContactMessages" />
        <Route path="/admin/settings" page={AdminSettingsPage} name="adminSettings" />
      </Private>

      <Set wrap={SiteLayout}>
        <Route path="/" page={HomePage} name="home" />
        <Route path="/about" page={AboutPage} name="about" />
        <Route path="/shop" page={ShopPage} name="shop" />
        <Route path="/shop/{id:Int}" page={ProductPage} name="product" />
        <Route path="/cart" page={CartPage} name="cart" />
        <Route path="/checkout/success" page={CheckoutSuccessPage} name="checkoutSuccess" />
        <Route path="/contact" page={ContactPage} name="contact" />
      </Set>
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
