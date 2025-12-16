import { createContext } from "@lit/context";
import { SidebarController } from "./sidebar.controller.ts";

export const sidebarControllerContext = createContext<SidebarController>(Symbol('sidebar-controller'));

