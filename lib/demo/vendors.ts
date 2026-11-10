/**
 * RICOZ Admin — Frontend Demo Vendors Service
 */

import { Vendor, VendorDocument, AdminUser } from "@/lib/admin/types";
import { getStorageItem, setStorageItem, STORAGE_KEYS } from "./storage";
import { DEFAULT_VENDORS, DEFAULT_VENDOR_DOCS, DEFAULT_USERS } from "./seedData";
import { logAuditEvent } from "./audit";

export function getVendors(filters?: {
  stage?: string;
  status?: string;
  category?: string;
  search?: string;
}): Vendor[] {
  let vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  const docs = getStorageItem<VendorDocument[]>(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  // Compute document verification counts and coordinator name
  vendors = vendors.map((v) => {
    const vDocs = docs.filter((d) => d.vendorId === v.id);
    const verifiedDocs = vDocs.filter((d) => d.isVerified).length;
    const coordinator = users.find((u) => u.id === v.assignedCoordinatorId);

    return {
      ...v,
      assignedCoordinatorName: coordinator ? coordinator.fullName : v.assignedCoordinatorName,
      verifiedDocsCount: verifiedDocs,
      totalDocsCount: vDocs.length,
    };
  });

  if (filters?.stage) {
    vendors = vendors.filter((v) => v.onboardingStage === filters.stage);
  }

  if (filters?.status) {
    vendors = vendors.filter((v) => v.verificationStatus === filters.status);
  }

  if (filters?.category) {
    vendors = vendors.filter((v) => (v.serviceCategory || "").toLowerCase().includes(filters.category!.toLowerCase()));
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase();
    vendors = vendors.filter(
      (v) =>
        v.name.toLowerCase().includes(q) ||
        (v.contactName || "").toLowerCase().includes(q) ||
        (v.contactEmail || "").toLowerCase().includes(q) ||
        (v.serviceCategory || "").toLowerCase().includes(q)
    );
  }

  return vendors;
}

export function getVendorById(id: string): { vendor: Vendor | null; documents: VendorDocument[] } {
  const vendors = getVendors();
  const vendor = vendors.find((v) => v.id === id) || null;
  const allDocs = getStorageItem<VendorDocument[]>(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);
  const documents = allDocs.filter((d) => d.vendorId === id);

  return { vendor, documents };
}

export function createVendor(data: Partial<Vendor>): Vendor {
  const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  const docs = getStorageItem<VendorDocument[]>(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);
  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);

  const coordinator = users.find((u) => u.id === data.assignedCoordinatorId);
  const now = new Date().toISOString();

  const newVendor: Vendor = {
    id: `ven-${Date.now().toString(36)}`,
    name: data.name || "Untitled Studio Partner",
    serviceCategory: data.serviceCategory || "Creative Design & Production",
    contactName: data.contactName || "",
    contactEmail: data.contactEmail || "",
    phone: data.phone || "",
    onboardingStage: data.onboardingStage || "application",
    verificationStatus: data.verificationStatus || "unverified",
    assignedCoordinatorId: data.assignedCoordinatorId || null,
    assignedCoordinatorName: coordinator ? coordinator.fullName : undefined,
    notes: data.notes || "",
    verifiedDocsCount: 0,
    totalDocsCount: 1,
    createdAt: now,
    updatedAt: now,
  };

  const initialDoc: VendorDocument = {
    id: `vdoc-${newVendor.id}-1`,
    vendorId: newVendor.id,
    documentType: "Master Services Agreement (MSA)",
    fileName: `${newVendor.name.toLowerCase().replace(/[^a-z0-9]+/g, "_")}_msa_pending.pdf`,
    fileUrl: "/docs/sample_msa.pdf",
    isVerified: false,
    createdAt: now,
  };

  setStorageItem(STORAGE_KEYS.VENDORS, [newVendor, ...vendors]);
  setStorageItem(STORAGE_KEYS.VENDOR_DOCS, [...docs, initialDoc]);

  logAuditEvent("vendor.create", "vendor", newVendor.id, `Registered creative vendor partner "${newVendor.name}"`);

  return newVendor;
}

export function updateVendor(id: string, data: Partial<Vendor>): Vendor | null {
  const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  const idx = vendors.findIndex((v) => v.id === id);
  if (idx === -1) return null;

  const users = getStorageItem<AdminUser[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  const coordId = data.assignedCoordinatorId !== undefined ? data.assignedCoordinatorId : vendors[idx].assignedCoordinatorId;
  const coordinator = users.find((u) => u.id === coordId);

  const updated: Vendor = {
    ...vendors[idx],
    ...data,
    assignedCoordinatorName: coordinator ? coordinator.fullName : vendors[idx].assignedCoordinatorName,
    updatedAt: new Date().toISOString(),
  };

  vendors[idx] = updated;
  setStorageItem(STORAGE_KEYS.VENDORS, vendors);

  logAuditEvent("vendor.update", "vendor", id, `Updated vendor partner "${updated.name}"`);

  return updated;
}

export function deleteVendor(id: string): boolean {
  const vendors = getStorageItem<Vendor[]>(STORAGE_KEYS.VENDORS, DEFAULT_VENDORS);
  const docs = getStorageItem<VendorDocument[]>(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);

  const target = vendors.find((v) => v.id === id);
  const filteredVendors = vendors.filter((v) => v.id !== id);
  const filteredDocs = docs.filter((d) => d.vendorId !== id);

  setStorageItem(STORAGE_KEYS.VENDORS, filteredVendors);
  setStorageItem(STORAGE_KEYS.VENDOR_DOCS, filteredDocs);

  logAuditEvent("vendor.delete", "vendor", id, `Deleted vendor partner "${target?.name || id}"`);
  return true;
}

export function verifyVendorDocument(
  vendorId: string,
  docId: string,
  isVerified: boolean
): VendorDocument | null {
  const docs = getStorageItem<VendorDocument[]>(STORAGE_KEYS.VENDOR_DOCS, DEFAULT_VENDOR_DOCS);
  const idx = docs.findIndex((d) => d.id === docId);
  if (idx === -1) return null;

  const now = new Date().toISOString();
  docs[idx] = {
    ...docs[idx],
    isVerified,
    verifiedAt: isVerified ? now : null,
    verifiedByUserName: isVerified ? "Operations Admin" : undefined,
  };

  setStorageItem(STORAGE_KEYS.VENDOR_DOCS, docs);

  // If all documents verified, update vendor verification status to verified
  const vDocs = docs.filter((d) => d.vendorId === vendorId);
  const allVerified = vDocs.length > 0 && vDocs.every((d) => d.isVerified);
  if (allVerified) {
    updateVendor(vendorId, { verificationStatus: "verified", onboardingStage: "approved" });
  } else if (!isVerified) {
    updateVendor(vendorId, { verificationStatus: "pending_review" });
  }

  logAuditEvent(
    "vendor.verify_doc",
    "vendor_document",
    docId,
    `Marked document "${docs[idx].fileName}" as ${isVerified ? "VERIFIED" : "UNVERIFIED"}`
  );

  return docs[idx];
}
