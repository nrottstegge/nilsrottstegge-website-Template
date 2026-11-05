---
{
  "title": "Multi-GPU HPCG",
  "kicker": "Project · ALPS supercomputer",
  "short": "Ported a single-GPU HPCG to many GPUs, then optimised it until it beat the original on one GPU.",
  "summary": "HPCG solves a 3D Poisson problem with a preconditioned conjugate gradient method and stresses memory bandwidth and interconnect rather than peak FLOPs. I started from an existing single-GPU implementation that stores the 27-point stencil matrix in the DIA format and parallelises symmetric Gauss-Seidel (SymGS) with box colouring, and ported it to multiple GPUs and nodes. The first port was slower than the original even on a single GPU: the ghost cells needed for the halo exchange broke coalesced memory access. Step by step I reworked indexing and data layout until the multi-GPU code, run on one GPU, was faster than the single-GPU code it came from: 1.50× for SpMV and 1.78× for SymGS. Then I scaled it out to 512 nodes and 2,048 GH200 GPUs on ALPS.",
  "contribution": [
    "Ported the DIA-based single-GPU HPCG to multiple GPUs and nodes: SpMV, SymGS, multigrid, CG, dot products and WAXPBY.",
    "Halo exchange over a 3D domain decomposition with up to 26 neighbours, using MPI (host and CUDA-aware) and NCCL.",
    "SpMV: locality-optimised indexing and column-major DIA storage, so consecutive threads read consecutive memory (84.6% memory utilisation efficiency).",
    "SymGS: colour-wise storage, so all coefficients of one box colour are contiguous and no colour offsets are computed at run time (92.0% memory utilisation efficiency)."
  ],
  "results": [
    "On one GH200, the multi-GPU code beats the original single-GPU code: 1.50× faster SpMV and 1.78× faster SymGS (from 0.32× and 0.68× after the naive port).",
    "Verified on up to 512 nodes, 2,048 NVIDIA GH200 GPUs, on the ALPS supercomputer.",
    "Ported to the AMD cluster Beverin.",
    "Lesson: a data layout that is best for one kernel can be the worst for another; colour-wise storage speeds up SymGS but slows SpMV to 0.72×."
  ],
  "tech": [
    "C++",
    "CUDA",
    "NCCL",
    "MPI",
    "Slurm",
    "ALPS"
  ],
  "cover": {
    "image": "/media/projects/gh200.webp",
    "alt": "NVIDIA GH200 Grace Hopper Superchip",
    "caption": "NVIDIA GH200 Grace Hopper Superchip (photo: NVIDIA).",
    "paper": true
  },
  "links": [
    {
      "label": "Repository",
      "href": "https://github.com/Jiela42/HighPerformanceHPCG_Thesis"
    }
  ],
  "media": [
    {
      "image": "/media/projects/hpcg-grid.svg",
      "alt": "An 8 × 8 × 8 grid of points in 3D, coloured from blue to red along its diagonal.",
      "caption": "The structured 3D grid behind HPCG’s 27-point stencil (8 × 8 × 8 points).",
      "paper": true
    },
    {
      "interactive": "hpcg-speedup",
      "alt": "Bar charts of the speedup of each optimisation step over the original single-GPU code, for SpMV and SymGS.",
      "caption": "From the naive port to faster-than-the-original: every step measured on one GH200 (256³ grid, multi-GPU code path) against the single-GPU code."
    },
    {
      "interactive": "hpcg-weak-scaling",
      "alt": "Line chart: time per CG iteration rises while GPUs gain neighbours, then stays flat at 283 to 300 ms from 216 to 1,728 GPUs.",
      "caption": "Weak scaling with 32³ points per GPU (median of 10 runs). The time per iteration grows while processes gain halo neighbours, then stays flat once most have all 26. Hover a point for details."
    },
    {
      "interactive": "box-colouring",
      "alt": "Interactive grid in 9 colours; the sweeps update one colour at a time.",
      "caption": "Box colouring makes symmetric Gauss-Seidel parallel. Shown in 2D with a 9-point stencil and 9 colours; HPCG’s 27-point stencil in 3D needs 27."
    }
  ],
  "order": 3
}
---
