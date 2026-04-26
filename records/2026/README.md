# Henry Local Records Mock Directory

This folder documents the local-first archive strategy used by the Henry module during Phase 1.

- Runtime archive entries are stored in the browser (localStorage) for this frontend-only implementation.
- Each generated quotation is assigned a logical path such as:
  - `/records/2026/April/Damac_Hills_2_Unit_449/`
- Archive history inside the UI regenerates PDFs from the stored document snapshot.

This folder is intentionally lightweight until a real API/storage service is introduced.
