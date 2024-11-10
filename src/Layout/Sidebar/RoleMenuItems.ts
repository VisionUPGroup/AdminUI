import {
  AlignLeft,
  Archive,
  BarChart,
  Box,
  Camera,
  Circle,
  Clipboard,
  DollarSign,
  Home,
  Icon,
  LogIn,
  Settings,
  Tag,
  UserPlus,
  Users,
} from "react-feather";

export type MenuType = "link" | "sub";
export interface MenuItem {
  path?: string;
  title: string;
  icon: Icon;
  type: MenuType;
  badgeType?: string;
  active: boolean;
  children?: MenuItem[];
  sidebartitle?: string;
}
// Menu items cho Staff (Role 2)
export const STAFF_MENU_ITEMS: MenuItem[] = [
  {
    title: "Products",
    icon: Box,
    type: "sub",
    active: false,
    children: [
      {
        title: "Physical",
        type: "sub",
        icon: Box,
        active: false,
        children: [
          {
            path: "/products/physical/category",
            title: "Category",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/physical/product-list",
            title: "Product List",
            type: "link",
            icon: Circle,
            active: false,
          },
        ],
      },
    ],
  },
  {
    title: "Sales",
    icon: DollarSign,
    type: "sub",
    active: false,
    children: [
      {
        path: "/sales/orders",
        title: "Orders",
        type: "link",
        icon: Circle,
        active: false,
      },
      {
        path: "/sales/transactions",
        title: "Transactions",
        type: "link",
        icon: Circle,
        active: false,
      },
    ],
  },
  {
    path: "/reports",
    title: "Reports",
    icon: BarChart,
    type: "link",
    active: false,
  },
  {
    title: "Settings",
    icon: Settings,
    type: "sub",
    active: false,
    children: [
      {
        path: "/settings/profile",
        title: "Profile",
        type: "link",
        icon: Circle,
        active: false,
      },
    ],
  },
];

// Menu items cho Admin (Role 3) - Giữ nguyên menu items hiện tại
export const ADMIN_MENU_ITEMS: MenuItem[] = [
  {
    path: "/dashboard",
    title: "Dashboard",
    icon: BarChart,
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
        title: "Physical",
        type: "sub",
        icon: Box,
        active: false,
        children: [
          {
            path: "/products/physical/category",
            title: "Category",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/physical/sub-category",
            title: "Sub Category",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/physical/product-list",
            title: "Product List",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/physical/product-detail",
            title: "Product Detail",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/physical/add-product",
            title: "Add Product",
            type: "link",
            icon: Circle,
            active: false,
          },
        ],
      },
      {
        title: "digital",
        type: "sub",
        icon: Box,
        active: false,
        children: [
          {
            path: "/products/digital/digital-category",
            title: "Category",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/digital/digital-sub-category",
            title: "Sub Category",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/digital/digital-product-list",
            title: "Product List",
            type: "link",
            icon: Circle,
            active: false,
          },
          {
            path: "/products/digital/digital-add-product",
            title: "Add Product",
            type: "link",
            icon: Circle,
            active: false,
          },
        ],
      },
    ],
  },
  {
    title: "Account",
    icon: Users,
    type: "sub",
    active: false,
    children: [
      {
        path: "/vendors/list-user",
        title: "User",
        type: "link",
        icon: Circle,
        active: false,
      },
      {
        path: "/vendors/list-staff",
        title: "Staff",
        type: "link",
        icon: Circle,
        active: false,
      },
    ],
  },
  {
    title: "Sales",
    icon: DollarSign,
    type: "sub",
    active: false,
    children: [
      {
        path: "/sales/orders",
        title: "Orders",
        type: "link",
        icon: Circle,
        active: false,
      },
      {
        path: "/sales/transactions",
        title: "Transactions",
        type: "link",
        icon: Circle,
        active: false,
      },
    ],
  },
  {
    title: "Kiosk",
    icon: Home,
    type: "sub",
    children: [
      {
        path: "/localization/translations",
        title: "Kiosk list",
        type: "link",
        icon: Circle,
        active: false,
      },
      {
        path: "/localization/kiosk-map",
        title: "Kiosk map",
        type: "link",
        icon: Circle,
        active: false,
      },
    ],
    active: false,
  },
];

// Function để lấy menu items dựa trên role
export const getMenuItemsByRole = (roleId?: string): MenuItem[] => {
  switch (roleId) {
    case "2":
      return STAFF_MENU_ITEMS;
    case "3":
      return ADMIN_MENU_ITEMS;
    default:
      return [];
  }
};
