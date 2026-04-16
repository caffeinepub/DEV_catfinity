import { c as createLucideIcon, j as jsxRuntimeExports, a as cn, e as useQueryClient } from "./index-DKuZmgR4.js";
import { u as useActor, a as useQuery, c as createActor } from "./backend-xwCXF0zU.js";
import { u as useMutation } from "./badge-v0DfYBji.js";
/**
 * @license lucide-react v0.511.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */
const __iconNode = [
  [
    "path",
    {
      d: "m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3",
      key: "wmoenq"
    }
  ],
  ["path", { d: "M12 9v4", key: "juzpu7" }],
  ["path", { d: "M12 17h.01", key: "p32p05" }]
];
const TriangleAlert = createLucideIcon("triangle-alert", __iconNode);
function Skeleton({ className, ...props }) {
  return /* @__PURE__ */ jsxRuntimeExports.jsx(
    "div",
    {
      "data-slot": "skeleton",
      className: cn("bg-accent animate-pulse rounded-md", className),
      ...props
    }
  );
}
const LESSONS = [
  {
    id: "introduction",
    title: "Introduction to (∞, 1)-Categories",
    subtitle: "Module 1",
    description: "An overview of higher category theory and why (∞, 1)-categories are the right framework for modern homotopy theory.",
    estimatedMinutes: 30,
    sections: [
      {
        heading: "What is a Category?",
        content: [
          {
            type: "paragraph",
            text: "A category consists of objects and morphisms between them, satisfying associativity and unit laws. Classical category theory studies 1-categories, where morphisms form sets."
          },
          {
            type: "math-block",
            latex: "\\mathrm{Hom}_{\\mathcal{C}}(X, Y) \\in \\mathbf{Set}"
          },
          {
            type: "paragraph",
            text: "In higher category theory, we allow morphisms between morphisms, and so on up the categorical ladder."
          }
        ]
      },
      {
        heading: "Why (∞, 1)?",
        content: [
          {
            type: "math-inline-paragraph",
            parts: [
              { kind: "text", text: "An " },
              { kind: "math", latex: "(\\infty, 1)" },
              {
                kind: "text",
                text: "-category has morphisms in all dimensions, but all morphisms above dimension 1 are invertible (equivalences). This captures the essence of homotopy theory: spaces have paths, homotopies between paths, homotopies between homotopies, and all of these are invertible."
              }
            ]
          },
          {
            type: "definition",
            term: "(∞, 1)-category",
            body: [
              {
                kind: "text",
                text: "A weak "
              },
              { kind: "math", latex: "(\\infty,1)" },
              {
                kind: "text",
                text: "-category is a category enriched over the Kan-Quillen model structure on simplicial sets, where all "
              },
              { kind: "math", latex: "k" },
              { kind: "text", text: "-morphisms for " },
              { kind: "math", latex: "k \\geq 2" },
              { kind: "text", text: " are invertible up to homotopy." }
            ]
          },
          {
            type: "math-block",
            latex: "\\pi_1(X, x_0) \\longrightarrow \\pi_1(X, x_0)"
          }
        ]
      },
      {
        heading: "The Fundamental Example",
        content: [
          {
            type: "paragraph",
            text: "The prototypical example of an (∞, 1)-category is the ∞-groupoid of a topological space. Objects are points, morphisms are paths, 2-morphisms are homotopies between paths, and so on."
          },
          {
            type: "math-block",
            latex: "\\Pi_{\\infty}(X) : \\mathbf{Top} \\longrightarrow \\mathbf{\\infty\\text{-}Grpd}"
          },
          {
            type: "paragraph",
            text: "Homotopy hypothesis (Grothendieck): the homotopy theory of spaces and the homotopy theory of ∞-groupoids are equivalent."
          }
        ]
      }
    ]
  },
  {
    id: "simplicial-sets",
    title: "Simplicial Sets",
    subtitle: "Module 2",
    description: "Simplicial sets provide the combinatorial underpinning for modern (∞, 1)-category theory. Learn the Δ-category, faces, degeneracies, and the nerve construction.",
    estimatedMinutes: 45,
    sections: [
      {
        heading: "The Simplex Category Δ",
        content: [
          {
            type: "math-inline-paragraph",
            parts: [
              {
                kind: "text",
                text: "The simplex category "
              },
              { kind: "math", latex: "\\Delta" },
              {
                kind: "text",
                text: " has objects the finite totally ordered sets "
              },
              { kind: "math", latex: "[n] = \\{0 < 1 < \\cdots < n\\}" },
              {
                kind: "text",
                text: " for "
              },
              { kind: "math", latex: "n \\geq 0" },
              {
                kind: "text",
                text: ", and morphisms are order-preserving maps."
              }
            ]
          },
          {
            type: "math-block",
            latex: "\\mathrm{Hom}_{\\Delta}([m],[n]) = \\{f : [m] \\to [n] \\mid i \\leq j \\Rightarrow f(i) \\leq f(j)\\}"
          }
        ]
      },
      {
        heading: "Simplicial Sets",
        content: [
          {
            type: "definition",
            term: "Simplicial Set",
            body: [
              { kind: "text", text: "A simplicial set is a functor " },
              {
                kind: "math",
                latex: "X : \\Delta^{\\mathrm{op}} \\to \\mathbf{Set}"
              },
              { kind: "text", text: ". The set " },
              { kind: "math", latex: "X_n = X([n])" },
              { kind: "text", text: " is called the set of " },
              { kind: "math", latex: "n" },
              { kind: "text", text: "-simplices." }
            ]
          },
          {
            type: "paragraph",
            text: "Face maps and degeneracy maps encode the boundary and degeneracy structure of simplicial sets, satisfying the simplicial identities."
          },
          {
            type: "math-block",
            latex: "d_i \\circ d_j = d_j \\circ d_{i+1} \\quad (i \\geq j)"
          }
        ]
      },
      {
        heading: "The Nerve of a Category",
        content: [
          {
            type: "paragraph",
            text: "Every ordinary category gives rise to a simplicial set via the nerve construction, embedding classical category theory into the world of simplicial sets."
          },
          {
            type: "math-block",
            latex: "N(\\mathcal{C})_n = \\mathrm{Fun}([n], \\mathcal{C}) = \\{x_0 \\xrightarrow{f_1} x_1 \\xrightarrow{f_2} \\cdots \\xrightarrow{f_n} x_n\\}"
          },
          {
            type: "paragraph",
            text: "The nerve functor is fully faithful, meaning the category can be recovered from its nerve up to isomorphism."
          }
        ]
      }
    ]
  },
  {
    id: "kan-complexes",
    title: "Kan Complexes",
    subtitle: "Module 3",
    description: "Kan complexes are simplicial sets satisfying a horn-filling condition that encodes invertibility of morphisms — the combinatorial model for ∞-groupoids.",
    estimatedMinutes: 50,
    sections: [
      {
        heading: "Horns and Horn-Filling",
        content: [
          {
            type: "math-inline-paragraph",
            parts: [
              { kind: "text", text: "The " },
              { kind: "math", latex: "k" },
              { kind: "text", text: "-horn " },
              { kind: "math", latex: "\\Lambda^n_k \\subset \\Delta^n" },
              {
                kind: "text",
                text: " is the simplicial subset obtained by removing the interior and the "
              },
              { kind: "math", latex: "k" },
              { kind: "text", text: "-th face from the standard " },
              { kind: "math", latex: "n" },
              { kind: "text", text: "-simplex." }
            ]
          },
          {
            type: "math-block",
            latex: "\\Lambda^n_k = \\bigcup_{j \\neq k} \\partial_j \\Delta^n \\subset \\Delta^n"
          }
        ]
      },
      {
        heading: "Kan Complexes",
        content: [
          {
            type: "definition",
            term: "Kan Complex",
            body: [
              {
                kind: "text",
                text: "A simplicial set "
              },
              { kind: "math", latex: "X" },
              {
                kind: "text",
                text: " is a Kan complex if every horn has a filler: for all "
              },
              { kind: "math", latex: "n \\geq 1" },
              { kind: "text", text: ", " },
              { kind: "math", latex: "0 \\leq k \\leq n" },
              {
                kind: "text",
                text: ", every map "
              },
              { kind: "math", latex: "f : \\Lambda^n_k \\to X" },
              { kind: "text", text: " extends to " },
              { kind: "math", latex: "\\tilde{f} : \\Delta^n \\to X" },
              { kind: "text", text: "." }
            ]
          },
          {
            type: "math-block",
            latex: '\\begin{tikzcd} \\Lambda^n_k \\arrow[r, "f"] \\arrow[d, hook] & X \\\\ \\Delta^n \\arrow[ur, dashed, "\\exists\\, \\tilde{f}"] & \\end{tikzcd}'
          },
          {
            type: "paragraph",
            text: "The singular complex of any topological space is a Kan complex, justifying the identification of Kan complexes with ∞-groupoids."
          }
        ]
      },
      {
        heading: "Homotopy Groups of Kan Complexes",
        content: [
          {
            type: "paragraph",
            text: "Kan complexes have well-defined homotopy groups. The fundamental groupoid is recovered from the 1-truncation."
          },
          {
            type: "math-block",
            latex: "\\pi_n(X, x) \\cong \\pi_n(|X|, x) \\quad \\text{for } X \\text{ a Kan complex}"
          }
        ]
      }
    ]
  },
  {
    id: "quasi-categories",
    title: "Quasi-categories",
    subtitle: "Module 4",
    description: "Quasi-categories (or ∞-categories in the sense of Joyal and Lurie) are simplicial sets with inner horn fillers — the model for (∞, 1)-categories.",
    estimatedMinutes: 60,
    sections: [
      {
        heading: "Inner Horns",
        content: [
          {
            type: "math-inline-paragraph",
            parts: [
              { kind: "text", text: "An inner horn " },
              { kind: "math", latex: "\\Lambda^n_k" },
              { kind: "text", text: " is a horn with " },
              { kind: "math", latex: "0 < k < n" },
              {
                kind: "text",
                text: ". Inner horn fillings encode composition of morphisms, unlike outer horns which encode invertibility."
              }
            ]
          },
          {
            type: "math-block",
            latex: "\\Lambda^2_1 : \\bullet \\xrightarrow{f} \\bullet \\xrightarrow{g} \\bullet \\quad \\leadsto \\quad g \\circ f"
          }
        ]
      },
      {
        heading: "Quasi-categories",
        content: [
          {
            type: "definition",
            term: "Quasi-category",
            body: [
              { kind: "text", text: "A " },
              { kind: "math", latex: "\\mathbf{quasi\\text{-}category}" },
              { kind: "text", text: " (also called an " },
              { kind: "math", latex: "\\infty" },
              {
                kind: "text",
                text: "-category in the sense of Joyal) is a simplicial set "
              },
              { kind: "math", latex: "\\mathcal{C}" },
              { kind: "text", text: " such that every inner horn " },
              {
                kind: "math",
                latex: "\\Lambda^n_k \\hookrightarrow \\mathcal{C}"
              },
              { kind: "text", text: " (with " },
              { kind: "math", latex: "0 < k < n" },
              { kind: "text", text: ") has a filler." }
            ]
          },
          {
            type: "math-block",
            latex: "\\mathrm{Map}_{\\mathcal{C}}(X, Y) \\in \\mathbf{Kan}"
          },
          {
            type: "paragraph",
            text: "The mapping space between any two objects in a quasi-category is a Kan complex, encoding the full homotopy type of the space of morphisms."
          }
        ]
      },
      {
        heading: "Joyal Model Structure",
        content: [
          {
            type: "paragraph",
            text: "The category of simplicial sets admits a model structure whose fibrant objects are exactly the quasi-categories. This is the Joyal model structure."
          },
          {
            type: "math-block",
            latex: "\\mathbf{sSet}_{\\text{Joyal}} \\xrightarrow{\\sim} (\\infty,1)\\text{-}\\mathbf{Cat}"
          },
          {
            type: "paragraph",
            text: "Lurie's Higher Topos Theory develops the foundations of this theory in great depth, establishing quasi-categories as the preferred model for ∞-categories."
          }
        ]
      }
    ]
  },
  {
    id: "homotopy-coherence",
    title: "Homotopy Coherence",
    subtitle: "Module 5",
    description: "Homotopy coherent diagrams and the ∞-categorical nerve unify classical coherence theorems with the higher-categorical perspective.",
    estimatedMinutes: 55,
    sections: [
      {
        heading: "Coherence Problems",
        content: [
          {
            type: "paragraph",
            text: "A fundamental challenge in higher category theory is ensuring that operations are coherent: associativity, unit laws, and interchange hold up to specified homotopies, which themselves satisfy higher coherence conditions."
          },
          {
            type: "math-block",
            latex: "(f \\circ g) \\circ h \\simeq f \\circ (g \\circ h) \\quad \\text{(associator)}"
          }
        ]
      },
      {
        heading: "Homotopy Coherent Diagrams",
        content: [
          {
            type: "definition",
            term: "Homotopy Coherent Diagram",
            body: [
              { kind: "text", text: "A homotopy coherent diagram of shape " },
              { kind: "math", latex: "\\mathcal{I}" },
              { kind: "text", text: " in an " },
              { kind: "math", latex: "(\\infty,1)" },
              { kind: "text", text: "-category " },
              { kind: "math", latex: "\\mathcal{C}" },
              { kind: "text", text: " is a functor of " },
              { kind: "math", latex: "(\\infty,1)" },
              { kind: "text", text: "-categories " },
              { kind: "math", latex: "F : \\mathcal{I} \\to \\mathcal{C}" },
              { kind: "text", text: "." }
            ]
          },
          {
            type: "math-block",
            latex: "\\mathrm{Fun}(\\mathcal{I}, \\mathcal{C}) := \\mathbf{sSet}(N(\\mathcal{I}), \\mathcal{C})"
          }
        ]
      },
      {
        heading: "Limits and Colimits",
        content: [
          {
            type: "paragraph",
            text: "Limits and colimits in (∞, 1)-categories generalize their classical counterparts but also capture homotopy-theoretic constructions like homotopy pullbacks and pushouts."
          },
          {
            type: "math-block",
            latex: "\\underset{\\longleftarrow}{\\lim}\\, F \\simeq \\mathrm{Map}_{\\mathcal{C}^{\\Delta^1}}(\\Delta^1, F)"
          },
          {
            type: "math-block",
            latex: "\\underset{\\longrightarrow}{\\mathrm{colim}}\\, F \\simeq F \\otimes_{\\mathcal{I}} \\Delta^0"
          },
          {
            type: "paragraph",
            text: "The ∞-categorical Yoneda lemma ensures that every (∞, 1)-category embeds fully faithfully into its ∞-category of presheaves, providing the universal ∞-categorical cocompletion."
          }
        ]
      }
    ]
  }
];
function getLessonById(id) {
  return LESSONS.find((l) => l.id === id);
}
function getLessonIndex(id) {
  return LESSONS.findIndex((l) => l.id === id);
}
function asActor(actor) {
  return actor;
}
function useProgress() {
  const { actor } = useActor(createActor);
  return useQuery({
    queryKey: ["progress"],
    queryFn: async () => {
      if (!actor) return [];
      const raw = await asActor(actor).getProgress();
      return raw.map((item) => ({
        lessonId: item.lessonId,
        completedAt: Number(item.completedAt)
      }));
    },
    enabled: !!actor,
    retry: 3,
    retryDelay: 1e3
  });
}
function useMarkComplete() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lessonId) => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).markComplete(lessonId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    }
  });
}
function useResetProgress() {
  const { actor } = useActor(createActor);
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Actor not available");
      await asActor(actor).resetProgress();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["progress"] });
    }
  });
}
function usePostTweet() {
  const { actor } = useActor(createActor);
  return useMutation({
    mutationFn: async ({
      lessonId,
      lessonTitle
    }) => {
      if (!actor) throw new Error("Actor not available");
      const result = await asActor(actor).postTweet(lessonId, lessonTitle);
      if ("ok" in result) {
        console.log("[Tweet] Posted successfully:", result.ok);
        return { success: true, message: result.ok };
      }
      console.warn("[Tweet] Post failed:", result.err);
      return { success: false, message: result.err };
    }
  });
}
export {
  LESSONS as L,
  Skeleton as S,
  TriangleAlert as T,
  useResetProgress as a,
  getLessonIndex as b,
  useMarkComplete as c,
  usePostTweet as d,
  getLessonById as g,
  useProgress as u
};
