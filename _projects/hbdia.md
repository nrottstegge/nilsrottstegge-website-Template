---
{
  "title": "HBDIA: Hybrid Blocked-DIA",
  "kicker": "Bachelor thesis · ETH Zurich, SPCL · 2025",
  "short": "A sparse matrix format that splits the work between the GPU and the CPU of a GH200.",
  "summary": "Sparse matrices from stencils have strong diagonal structure, but real matrices also contain irregular outliers. HBDIA cuts the matrix into warp-wide column blocks, keeps locally dense diagonals in a blocked DIA layout for coalesced GPU access, and relegates sparse diagonals to a COO part that the Grace CPU of an NVIDIA GH200 can process concurrently. A performance model of transfer and aggregation costs guides the split. Advisors: Prof. Dr. Torsten Hoefler and Yakup Koray Budanaz.",
  "contribution": [
    "Designed the HBDIA format and a direct two-pass COO → HBDIA conversion.",
    "Implemented the SpMV GPU kernel with fully coalesced block access, CPU COO fallback and multi-GPU execution via MPI.",
    "Developed a performance model for heterogeneous CPU–GPU execution on tightly coupled systems."
  ],
  "results": [
    "Up to 2.2× faster than cuSPARSE on stencil matrices.",
    "Up to 1.6× on a PDE-constrained optimisation matrix (nlpkkt240) and 1.5× on a 3D fluid channel simulation.",
    "Storage stays below COO even with up to 100% added random entries."
  ],
  "tech": [
    "C++",
    "CUDA",
    "cuSPARSE",
    "OpenMP",
    "MPI",
    "NVIDIA GH200",
    "Nsight Compute"
  ],
  "links": [
    {
      "label": "Thesis (ETH Research Collection)",
      "href": "https://doi.org/10.3929/ethz-c-000784413"
    },
    {
      "label": "Repository",
      "href": "https://github.com/nrottstegge/HBDIA"
    }
  ],
  "media": [
    {
      "interactive": "hbdia",
      "alt": "Interactive HBDIA figure: a sparse matrix in dense, DIA and HBDIA form, with each nonzero coloured by whether it lands on the GPU or the CPU.",
      "caption": "The example from my thesis (block width 8): hover an entry to follow it from the dense matrix through DIA into the GPU blocks or the CPU’s COO list. Move the threshold to change the split."
    }
  ],
  "order": 2
}
---
