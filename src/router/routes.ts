import type { RouteRecordRaw } from "vue-router"

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      {
        path: "",
        component: () => import("pages/Sketch.vue")
      },
      {
        path: ":userId/sketch/:sketchId",
        component: () => import("pages/Sketch.vue")
      },
      {
        path: ":userId",
        children: [
          {
            path: "sketches",
            component: () => import("pages/[id]/sketches.vue")
          }
        ]
      },
      {
        path: "sign-in",
        component: () => import("pages/SignIn.vue"),
        meta: {
          auth: false
        }
      },
      {
        path: "sign-up",
        component: () => import("pages/SignUp.vue"),
        meta: {
          auth: false
        }
      },
      {
        path: "forgot-password",
        component: () => import("pages/ForgotPassword.vue")
      }
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue")
  }
]

export default routes
