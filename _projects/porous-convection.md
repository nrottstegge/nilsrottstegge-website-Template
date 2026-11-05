---
{
  "title": "Porous Convection on GPUs",
  "kicker": "Course project · ETH Zurich",
  "short": "Thermal convection solvers in Julia, distributed over GPUs with MPI.",
  "summary": "Hot fluid rises, cold fluid sinks, and in a porous medium this forms plumes. The solvers discretise the equations with finite differences, iterate them with pseudo-transient relaxation and split the domain across GPUs with MPI. Course on solving partial differential equations in parallel on GPUs.",
  "contribution": [
    "2D and 3D thermal porous-convection solvers with ParallelStencil.jl.",
    "MPI domain decomposition for multi-GPU runs."
  ],
  "results": [
    "Distributed execution validated on eight GPUs across two nodes."
  ],
  "tech": [
    "Julia",
    "ParallelStencil.jl",
    "MPI",
    "GLMakie"
  ],
  "links": [
    {
      "label": "Repository",
      "href": "https://github.com/nrottstegge/pde-on-gpu-nils-rottstegge/tree/c0274508e9d67777d01cd36b8a9286ee561297cb/PorousConvection"
    }
  ],
  "media": [
    {
      "video": "/media/projects/porous-convection",
      "alt": "Temperature field of 2D porous convection: hot plumes rise from the bottom, cold ones sink from the top, arrows show the flow.",
      "caption": "2D thermal porous convection: temperature field and flow."
    }
  ],
  "order": 4
}
---
