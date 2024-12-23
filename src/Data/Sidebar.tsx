import store from "@/Redux/Store";
import { AlignLeft, Archive, BarChart, Box, Camera, Clipboard, DollarSign, Home, LogIn, Settings, Tag, UserPlus, Users } from "react-feather";

export const MENUITEMS: any = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: Home,
    type: "link",
    badgeType: "primary",
    active: false,
  },
  {
    title: "Products",
    icon: Box,
    type: "sub",
    active: false,
    children: [
      {
        title: "EyeGlass",
        type: "sub",
        active: false,
        children: [
          { path: "/products/eyeglass", title: "List", type: "link" }
        ],
      },
      {
        title: "Lens",
        type: "sub",
        active: false,
        children: [
          { path: "/products/lens", title: "List", type: "link" }
        ],
      },
      // {
      //   title: "Physical",
      //   type: "sub",
      //   active: false,
      //   children: [
      //     { path: "/products/physical/category", title: "Category", type: "link" },
      //     { path: "/products/physical/sub-category", title: "Sub Category", type: "link" },
      //     { path: "/products/physical/product-list", title: "Product List", type: "link" },
      //     { path: "/products/physical/product-detail", title: "Product Detail", type: "link" },
      //     { path: "/products/physical/add-product", title: "Add Product", type: "link" },
      //   ],
      // },
      // {
      //   title: "digital",
      //   type: "sub",
      //   active: false,
      //   children: [
      //     { path: "/products/digital/digital-category", title: "Category", type: "link" },
      //     { path: "/products/digital/digital-sub-category", title: "Sub Category", type: "link" },
      //     { path: "/products/digital/digital-product-list", title: "Product List", type: "link" },
      //     { path: "/products/digital/digital-add-product", title: "Add Product", type: "link" },
      //   ],
      // },
    ],
  },
  {
    title: "Sales",
    icon: DollarSign,
    type: "sub",
    active: false,
    children: [
      { path: "/sales/orders", title: "Orders", type: "link" },
      { path: "/sales/transactions", title: "Transactions", type: "link" },
    ],
  },
  {
    title: "Coupons",
    icon: Tag,
    type: "sub",
    active: false,
    children: [
      { path: "/coupons/list-coupons", title: "List Coupons", type: "link" },
      { path: "/coupons/create-coupons", title: "Create Coupons", type: "link" },
    ],
  },
  {
    title: "Pages",
    icon: Clipboard,
    type: "sub",
    active: false,
    children: [
      { path: "/pages/list-page", title: "List Page", type: "link" },
      { path: "/pages/create-page", title: "Create Page", type: "link" },
    ],
  },
  {
    title: "Media",
    path: "/media",
    icon: Camera,
    type: "link",
    active: false,
  },
  {
    title: "Menus",
    icon: AlignLeft,
    type: "sub",
    active: false,
    children: [
      { path: "/menus/list-menu", title: "List Menu", type: "link" },
      { path: "/menus/create-menu", title: "Create Menu", type: "link" },
    ],
  },
  {
    title: "Users",
    icon: UserPlus,
    type: "sub",
    active: false,
    children: [
      { path: "/users/list-user", title: "User List", type: "link" },
      { path: "/users/create-user", title: "Create User", type: "link" },
    ],
  },
  {
    title: "Account",
    icon: Users,
    type: "sub",
    active: false,
    children: [
      { path: "/vendors/list-user", title: "User", type: "link" },
      { path: "/vendors/list-staff", title: "Staff", type: "link" },
    ],
  },
  {
    title: "Kiosk",
    icon:  Home,
    type: "sub",
    children: [
      { path: "/localization/translations", title: "Kiosk list", type: "link" },
      { path: "/localization/kiosk-map", title: "Kiosk map", type: "link" },
      // { path: "/localization/currency-rates", title: "Currency Rates", type: "link" },
      // { path: "/localization/taxes", title: "Taxes", type: "link" },
    ],
  },
  {
    title: "Reports",
    path: "/reports",
    icon: BarChart,
    type: "link",
    active: false,
  },
  {
    title: "Settings",
    icon: Settings,
    type: "sub",
    children: [{ path: "/settings/profile", title: "Profile", type: "link" }],
  },
  {
    title: "Invoice",
    path: "/invoice",
    icon: Archive,
    type: "link",
    active: false,
  },
  {
    title: "Login",
    path: "/auth/login",
    icon: LogIn,
    type: "link",
    active: false,
  },
];
