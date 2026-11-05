---
{
  "title": "Adaptive Trees on a GPU",
  "kicker": "Research · Jülich Supercomputing Centre · 2026",
  "short": "Adaptive octrees for the Fast Multipole Method, rebuilt on the GPU every time step.",
  "summary": "The Fast Multipole Method needs a spatial hierarchy over the particles. Dense trees waste work and memory on empty space; pointer-based sparse trees waste GPU efficiency. This project builds adaptive octrees and binary trees that sit between the two, represented as sorted arrays of space-filling-curve keys so every step is a bulk parallel primitive. Guest Student Programme 2026, August to October.",
  "contribution": [
    "Adaptive octrees and binary (KDTree3D) trees in C++/CUDA on the Cornerstone representation: sorted Morton keys and leaf boundaries.",
    "NFCount: refinement driven by the expected near-field work of a leaf and its neighbours, not by particle count alone.",
    "TreeView: reconstructs the internal FMM hierarchy directly from the leaves in a few parallel passes, without pointers or host readback.",
    "GPU optimisations: cooperative stencil evaluation, caching and compaction, fixed-capacity buffers, overlapping streams and CUDA Graphs."
  ],
  "results": [
    "Tree update and hierarchy construction up to 2.4× faster than Cornerstone (baseline).",
    "Complete FMM execution up to 4.8× faster than with a dense tree."
  ],
  "tech": [
    "C++20",
    "CUDA",
    "CUDA Graphs",
    "CUB",
    "CMake",
    "Catch2 / CTest",
    "JUPITER"
  ],
  "links": [
    {
      "label": "Report",
      "href": "https://nrottstegge.github.io/Adaptive_Trees/report/"
    },
    {
      "label": "Slides",
      "href": "https://nrottstegge.github.io/Adaptive_Trees/slides/"
    },
    {
      "label": "Repository",
      "href": "https://github.com/nrottstegge/Adaptive_Trees"
    }
  ],
  "media": [
    {
      "video": "/media/projects/adaptive-trees",
      "alt": "Flyby dataset: a star passes a galaxy while an adaptive octree refines where the particles go.",
      "caption": "Flyby dataset: a star passes a galaxy; the adaptive octree (NFCount) follows the particles."
    },
    {
      "video": "/media/projects/coulomb-explosion",
      "alt": "Coulomb explosion: 100,000 charged particles expand while an adaptive octree follows them.",
      "caption": "Coulomb explosion, 100,000 particles."
    }
  ],
  "viewer": [
    {
      "url": "/media/viewer/scene-9.html",
      "dataset": "Flyby",
      "short": "first snapshot",
      "note": "All particles start in a thin disc; the rest of the domain stays coarse.",
      "particles": "512,002"
    },
    {
      "url": "/media/viewer/scene-8.html",
      "dataset": "Flyby",
      "short": "evolved",
      "note": "About 1,000 snapshots later, the tree has followed the particles.",
      "particles": "512,002"
    },
    {
      "url": "/media/viewer/scene-6.html",
      "dataset": "Dense halo",
      "short": "slice",
      "note": "A slice through the tree: red is deep, blue is shallow. A subsample of the 25,600,000 particles is shown.",
      "particles": "25,600,000"
    }
  ],
  "order": 1
}
---
