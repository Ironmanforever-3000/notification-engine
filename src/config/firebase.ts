import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";
import { env } from "./env";

let messaging: any = null;

if (env.firebaseProjectId !== "mock-project-id" && env.firebaseProjectId !== "") {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: env.firebaseProjectId,
        clientEmail: env.firebaseClientEmail,
        privateKey: env.firebasePrivateKey,
      }),
    });
  }
  messaging = getMessaging();
}

export const firebaseMessaging = messaging;