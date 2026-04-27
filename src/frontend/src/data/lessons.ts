import type { Lesson } from "../types";

export const LESSONS: Lesson[] = [
  {
    id: "introduction",
    title: "Introduction to (∞, 1)-Categories",
    subtitle: "Module 1",
    description:
      "An overview of higher category theory and why (∞, 1)-categories are the right framework for modern homotopy theory.",
    estimatedMinutes: 30,
    sections: [
      {
        heading: "What is a Category?",
        content: [
          {
            type: "paragraph",
            text: "A category consists of objects and morphisms between them, satisfying associativity and unit laws. Classical category theory studies 1-categories, where morphisms form sets.",
          },
          {
            type: "math-block",
            latex: "\\mathrm{Hom}_{\\mathcal{C}}(X, Y) \\in \\mathbf{Set}",
          },
          {
            type: "paragraph",
            text: "In higher category theory, we allow morphisms between morphisms, and so on up the categorical ladder.",
          },
        ],
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
                text: "-category has morphisms in all dimensions, but all morphisms above dimension 1 are invertible (equivalences). This captures the essence of homotopy theory: spaces have paths, homotopies between paths, homotopies between homotopies, and all of these are invertible.",
              },
            ],
          },
          {
            type: "definition",
            term: "(∞, 1)-category",
            body: [
              {
                kind: "text",
                text: "A weak ",
              },
              { kind: "math", latex: "(\\infty,1)" },
              {
                kind: "text",
                text: "-category is a category enriched over the Kan-Quillen model structure on simplicial sets, where all ",
              },
              { kind: "math", latex: "k" },
              { kind: "text", text: "-morphisms for " },
              { kind: "math", latex: "k \\geq 2" },
              { kind: "text", text: " are invertible up to homotopy." },
            ],
          },
          {
            type: "math-block",
            latex: "\\pi_1(X, x_0) \\longrightarrow \\pi_1(X, x_0)",
          },
        ],
      },
      {
        heading: "The Fundamental Example",
        content: [
          {
            type: "paragraph",
            text: "The prototypical example of an (∞, 1)-category is the ∞-groupoid of a topological space. Objects are points, morphisms are paths, 2-morphisms are homotopies between paths, and so on.",
          },
          {
            type: "math-block",
            latex:
              "\\Pi_{\\infty}(X) : \\mathbf{Top} \\longrightarrow \\mathbf{\\infty\\text{-}Grpd}",
          },
          {
            type: "paragraph",
            text: "Homotopy hypothesis (Grothendieck): the homotopy theory of spaces and the homotopy theory of ∞-groupoids are equivalent.",
          },
        ],
      },
    ],
  },
  {
    id: "simplicial-sets",
    title: "Simplicial Sets",
    subtitle: "Module 2",
    description:
      "Simplicial sets provide the combinatorial underpinning for modern (∞, 1)-category theory. Learn the Δ-category, faces, degeneracies, and the nerve construction.",
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
                text: "The simplex category ",
              },
              { kind: "math", latex: "\\Delta" },
              {
                kind: "text",
                text: " has objects the finite totally ordered sets ",
              },
              { kind: "math", latex: "[n] = \\{0 < 1 < \\cdots < n\\}" },
              {
                kind: "text",
                text: " for ",
              },
              { kind: "math", latex: "n \\geq 0" },
              {
                kind: "text",
                text: ", and morphisms are order-preserving maps.",
              },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\mathrm{Hom}_{\\Delta}([m],[n]) = \\{f : [m] \\to [n] \\mid i \\leq j \\Rightarrow f(i) \\leq f(j)\\}",
          },
        ],
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
                latex: "X : \\Delta^{\\mathrm{op}} \\to \\mathbf{Set}",
              },
              { kind: "text", text: ". The set " },
              { kind: "math", latex: "X_n = X([n])" },
              { kind: "text", text: " is called the set of " },
              { kind: "math", latex: "n" },
              { kind: "text", text: "-simplices." },
            ],
          },
          {
            type: "paragraph",
            text: "Face maps and degeneracy maps encode the boundary and degeneracy structure of simplicial sets, satisfying the simplicial identities.",
          },
          {
            type: "math-block",
            latex: "d_i \\circ d_j = d_j \\circ d_{i+1} \\quad (i \\geq j)",
          },
        ],
      },
      {
        heading: "The Nerve of a Category",
        content: [
          {
            type: "paragraph",
            text: "Every ordinary category gives rise to a simplicial set via the nerve construction, embedding classical category theory into the world of simplicial sets.",
          },
          {
            type: "math-block",
            latex:
              "N(\\mathcal{C})_n = \\mathrm{Fun}([n], \\mathcal{C}) = \\{x_0 \\xrightarrow{f_1} x_1 \\xrightarrow{f_2} \\cdots \\xrightarrow{f_n} x_n\\}",
          },
          {
            type: "paragraph",
            text: "The nerve functor is fully faithful, meaning the category can be recovered from its nerve up to isomorphism.",
          },
        ],
      },
    ],
  },
  {
    id: "kan-complexes",
    title: "Kan Complexes",
    subtitle: "Module 3",
    description:
      "Kan complexes are simplicial sets satisfying a horn-filling condition that encodes invertibility of morphisms — the combinatorial model for ∞-groupoids.",
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
                text: " is the simplicial subset obtained by removing the interior and the ",
              },
              { kind: "math", latex: "k" },
              { kind: "text", text: "-th face from the standard " },
              { kind: "math", latex: "n" },
              { kind: "text", text: "-simplex." },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\Lambda^n_k = \\bigcup_{j \\neq k} \\partial_j \\Delta^n \\subset \\Delta^n",
          },
        ],
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
                text: "A simplicial set ",
              },
              { kind: "math", latex: "X" },
              {
                kind: "text",
                text: " is a Kan complex if every horn has a filler: for all ",
              },
              { kind: "math", latex: "n \\geq 1" },
              { kind: "text", text: ", " },
              { kind: "math", latex: "0 \\leq k \\leq n" },
              {
                kind: "text",
                text: ", every map ",
              },
              { kind: "math", latex: "f : \\Lambda^n_k \\to X" },
              { kind: "text", text: " extends to " },
              { kind: "math", latex: "\\tilde{f} : \\Delta^n \\to X" },
              { kind: "text", text: "." },
            ],
          },
          {
            type: "math-block",
            latex:
              '\\begin{tikzcd} \\Lambda^n_k \\arrow[r, "f"] \\arrow[d, hook] & X \\\\ \\Delta^n \\arrow[ur, dashed, "\\exists\\, \\tilde{f}"] & \\end{tikzcd}',
          },
          {
            type: "paragraph",
            text: "The singular complex of any topological space is a Kan complex, justifying the identification of Kan complexes with ∞-groupoids.",
          },
        ],
      },
      {
        heading: "Homotopy Groups of Kan Complexes",
        content: [
          {
            type: "paragraph",
            text: "Kan complexes have well-defined homotopy groups. The fundamental groupoid is recovered from the 1-truncation.",
          },
          {
            type: "math-block",
            latex:
              "\\pi_n(X, x) \\cong \\pi_n(|X|, x) \\quad \\text{for } X \\text{ a Kan complex}",
          },
        ],
      },
    ],
  },
  {
    id: "quasi-categories",
    title: "Quasi-categories",
    subtitle: "Module 4",
    description:
      "Quasi-categories (or ∞-categories in the sense of Joyal and Lurie) are simplicial sets with inner horn fillers — the model for (∞, 1)-categories.",
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
                text: ". Inner horn fillings encode composition of morphisms, unlike outer horns which encode invertibility.",
              },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\Lambda^2_1 : \\bullet \\xrightarrow{f} \\bullet \\xrightarrow{g} \\bullet \\quad \\leadsto \\quad g \\circ f",
          },
        ],
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
                text: "-category in the sense of Joyal) is a simplicial set ",
              },
              { kind: "math", latex: "\\mathcal{C}" },
              { kind: "text", text: " such that every inner horn " },
              {
                kind: "math",
                latex: "\\Lambda^n_k \\hookrightarrow \\mathcal{C}",
              },
              { kind: "text", text: " (with " },
              { kind: "math", latex: "0 < k < n" },
              { kind: "text", text: ") has a filler." },
            ],
          },
          {
            type: "math-block",
            latex: "\\mathrm{Map}_{\\mathcal{C}}(X, Y) \\in \\mathbf{Kan}",
          },
          {
            type: "paragraph",
            text: "The mapping space between any two objects in a quasi-category is a Kan complex, encoding the full homotopy type of the space of morphisms.",
          },
        ],
      },
      {
        heading: "Joyal Model Structure",
        content: [
          {
            type: "paragraph",
            text: "The category of simplicial sets admits a model structure whose fibrant objects are exactly the quasi-categories. This is the Joyal model structure.",
          },
          {
            type: "math-block",
            latex:
              "\\mathbf{sSet}_{\\text{Joyal}} \\xrightarrow{\\sim} (\\infty,1)\\text{-}\\mathbf{Cat}",
          },
          {
            type: "paragraph",
            text: "Lurie's Higher Topos Theory develops the foundations of this theory in great depth, establishing quasi-categories as the preferred model for ∞-categories.",
          },
        ],
      },
    ],
  },
  {
    id: "homotopy-coherence",
    title: "Homotopy Coherence",
    subtitle: "Module 5",
    description:
      "Homotopy coherent diagrams and the ∞-categorical nerve unify classical coherence theorems with the higher-categorical perspective.",
    estimatedMinutes: 55,
    sections: [
      {
        heading: "Coherence Problems",
        content: [
          {
            type: "paragraph",
            text: "A fundamental challenge in higher category theory is ensuring that operations are coherent: associativity, unit laws, and interchange hold up to specified homotopies, which themselves satisfy higher coherence conditions.",
          },
          {
            type: "math-block",
            latex:
              "(f \\circ g) \\circ h \\simeq f \\circ (g \\circ h) \\quad \\text{(associator)}",
          },
        ],
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
              { kind: "text", text: "." },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\mathrm{Fun}(\\mathcal{I}, \\mathcal{C}) := \\mathbf{sSet}(N(\\mathcal{I}), \\mathcal{C})",
          },
        ],
      },
      {
        heading: "Limits and Colimits",
        content: [
          {
            type: "paragraph",
            text: "Limits and colimits in (∞, 1)-categories generalize their classical counterparts but also capture homotopy-theoretic constructions like homotopy pullbacks and pushouts.",
          },
          {
            type: "math-block",
            latex:
              "\\underset{\\longleftarrow}{\\lim}\\, F \\simeq \\mathrm{Map}_{\\mathcal{C}^{\\Delta^1}}(\\Delta^1, F)",
          },
          {
            type: "math-block",
            latex:
              "\\underset{\\longrightarrow}{\\mathrm{colim}}\\, F \\simeq F \\otimes_{\\mathcal{I}} \\Delta^0",
          },
          {
            type: "paragraph",
            text: "The ∞-categorical Yoneda lemma ensures that every (∞, 1)-category embeds fully faithfully into its ∞-category of presheaves, providing the universal ∞-categorical cocompletion.",
          },
        ],
      },
    ],
  },
  {
    id: "model-categories",
    title: "Model Categories",
    subtitle: "Module 6",
    description:
      "Quillen's model categories provide a powerful axiomatic framework for abstract homotopy theory, connecting classical topology to (∞, 1)-categories.",
    estimatedMinutes: 65,
    sections: [
      {
        heading: "The Axioms",
        content: [
          {
            type: "paragraph",
            text: "A model category is a category equipped with three distinguished classes of morphisms — weak equivalences, fibrations, and cofibrations — satisfying axioms that allow the construction of a homotopy category.",
          },
          {
            type: "definition",
            term: "Model Category",
            body: [
              { kind: "text", text: "A " },
              { kind: "math", latex: "\\mathbf{model\\ category}" },
              { kind: "text", text: " is a complete and cocomplete category " },
              { kind: "math", latex: "\\mathcal{M}" },
              {
                kind: "text",
                text: " together with three classes of maps — weak equivalences (",
              },
              { kind: "math", latex: "\\mathcal{W}" },
              { kind: "text", text: "), fibrations (" },
              { kind: "math", latex: "\\mathcal{F}" },
              { kind: "text", text: "), cofibrations (" },
              { kind: "math", latex: "\\mathcal{C}" },
              {
                kind: "text",
                text: ") — satisfying the two-out-of-three property, retract closure, lifting, and factorization axioms.",
              },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\mathcal{M} = (\\mathcal{M}, \\mathcal{W}, \\mathcal{F}, \\mathcal{C})",
          },
        ],
      },
      {
        heading: "The Homotopy Category",
        content: [
          {
            type: "paragraph",
            text: "The homotopy category Ho(M) is obtained from a model category by formally inverting the weak equivalences. This is the shadow of the (∞, 1)-categorical localization.",
          },
          {
            type: "math-block",
            latex:
              "\\mathrm{Ho}(\\mathcal{M}) = \\mathcal{M}[\\mathcal{W}^{-1}]",
          },
          {
            type: "paragraph",
            text: "Quillen adjunctions and Quillen equivalences between model categories induce adjunctions and equivalences between the corresponding (∞, 1)-categories.",
          },
        ],
      },
      {
        heading: "Key Examples",
        content: [
          {
            type: "paragraph",
            text: "The Kan-Quillen model structure on simplicial sets (weak equivalences = weak homotopy equivalences of geometric realizations) is Quillen equivalent to the standard model structure on topological spaces.",
          },
          {
            type: "math-block",
            latex:
              "\\mathbf{sSet}_{\\mathrm{KQ}} \\underset{|{-}|}{{\\rightleftharpoons}} \\mathbf{Top}_{\\mathrm{Quillen}} : \\mathrm{Sing}",
          },
          {
            type: "paragraph",
            text: "The Joyal model structure on simplicial sets has weak equivalences the categorical equivalences of quasi-categories, and its fibrant objects are exactly the quasi-categories.",
          },
        ],
      },
    ],
  },
  {
    id: "enriched-categories",
    title: "Enriched Categories",
    subtitle: "Module 7",
    description:
      "Enriched category theory generalizes classical categories by replacing hom-sets with objects in a monoidal category, providing the language for (∞, 1)-categories enriched over spaces.",
    estimatedMinutes: 60,
    sections: [
      {
        heading: "Categories Enriched over a Monoidal Category",
        content: [
          {
            type: "definition",
            term: "Enriched Category",
            body: [
              { kind: "text", text: "A category " },
              { kind: "math", latex: "\\mathcal{C}" },
              { kind: "text", text: " enriched over a monoidal category " },
              { kind: "math", latex: "(\\mathcal{V}, \\otimes, \\mathbf{1})" },
              {
                kind: "text",
                text: " consists of a collection of objects, hom-objects ",
              },
              {
                kind: "math",
                latex: "\\mathcal{C}(X,Y) \\in \\mathcal{V}",
              },
              {
                kind: "text",
                text: ", composition morphisms, and identity morphisms satisfying associativity and unit axioms in ",
              },
              { kind: "math", latex: "\\mathcal{V}" },
              { kind: "text", text: "." },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\circ_{XYZ} : \\mathcal{C}(Y,Z) \\otimes \\mathcal{C}(X,Y) \\to \\mathcal{C}(X,Z)",
          },
        ],
      },
      {
        heading: "Topological and Simplicial Categories",
        content: [
          {
            type: "paragraph",
            text: "A topologically enriched category (Top-category) has hom-spaces that are topological spaces. A simplicial category (sSet-category) has hom-spaces that are simplicial sets.",
          },
          {
            type: "math-block",
            latex:
              "\\mathcal{C}(X,Y) \\in \\mathbf{Top} \\quad \\text{or} \\quad \\mathcal{C}(X,Y) \\in \\mathbf{sSet}",
          },
          {
            type: "paragraph",
            text: "The coherent nerve of a simplicial category is a quasi-category, providing a bridge between the simplicial and quasi-categorical models of (∞, 1)-categories.",
          },
        ],
      },
      {
        heading: "Comparison of Models",
        content: [
          {
            type: "paragraph",
            text: "Different models for (∞, 1)-categories — quasi-categories, complete Segal spaces, Segal categories, simplicial categories — are all Quillen equivalent, meaning they present the same homotopy theory.",
          },
          {
            type: "math-block",
            latex:
              "\\mathbf{qCat} \\simeq \\mathbf{CSS} \\simeq \\mathbf{SegCat} \\simeq \\mathbf{sCat}",
          },
          {
            type: "example",
            body: [
              { kind: "text", text: "The nerve of a " },
              { kind: "math", latex: "\\mathbf{Top}" },
              { kind: "text", text: "-enriched category " },
              { kind: "math", latex: "\\mathcal{C}" },
              {
                kind: "text",
                text: " yields a complete Segal space, and its coherent nerve is a quasi-category. These are connected by explicit functors forming a chain of Quillen equivalences.",
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "infinity-toposes",
    title: "∞-Toposes",
    subtitle: "Module 8",
    description:
      "Lurie's ∞-toposes generalize classical Grothendieck toposes to the higher-categorical setting, unifying homotopy theory and sheaf theory.",
    estimatedMinutes: 75,
    sections: [
      {
        heading: "From Toposes to ∞-Toposes",
        content: [
          {
            type: "paragraph",
            text: "A classical Grothendieck topos is a category of sheaves on a site. An ∞-topos is an (∞, 1)-category that looks like the (∞, 1)-category of ∞-groupoid-valued sheaves on some ∞-site.",
          },
          {
            type: "definition",
            term: "∞-Topos",
            body: [
              { kind: "text", text: "An " },
              { kind: "math", latex: "\\infty" },
              {
                kind: "text",
                text: "-topos is an accessible left exact localization of a presheaf (∞, 1)-category ",
              },
              { kind: "math", latex: "\\mathcal{P}(\\mathcal{C})" },
              { kind: "text", text: " for some small " },
              { kind: "math", latex: "(\\infty,1)" },
              { kind: "text", text: "-category " },
              { kind: "math", latex: "\\mathcal{C}" },
              { kind: "text", text: "." },
            ],
          },
          {
            type: "math-block",
            latex:
              "\\mathcal{X} \\hookrightarrow \\mathcal{P}(\\mathcal{C}) = \\mathrm{Fun}(\\mathcal{C}^{\\mathrm{op}}, \\mathcal{S})",
          },
        ],
      },
      {
        heading: "The ∞-Category of Spaces",
        content: [
          {
            type: "paragraph",
            text: "The ∞-category of spaces S is the primordial example of an ∞-topos. Objects are ∞-groupoids (homotopy types), and every ∞-topos is a generalized category of spaces.",
          },
          {
            type: "math-block",
            latex:
              "\\mathcal{S} = N(\\mathbf{Kan}) \\simeq \\mathrm{L}^H(\\mathbf{sSet}_{\\mathrm{KQ}})",
          },
          {
            type: "paragraph",
            text: "The universal property: any ∞-topos X has a unique geometric morphism X → S, expressing that ∞-toposes are 'generalized homotopy theories' over the base ∞-topos of spaces.",
          },
        ],
      },
      {
        heading: "Descent and Object Classifiers",
        content: [
          {
            type: "paragraph",
            text: "The key characterization of ∞-toposes is the descent property: colimits are 'universal' (stable under pullback), and there exist object classifiers generalizing the subobject classifier of 1-toposes.",
          },
          {
            type: "math-block",
            latex:
              "\\mathcal{X}_{/X} \\xrightarrow{\\sim} \\mathrm{Fun}(X, \\mathcal{X}) \\quad \\text{(descent)}",
          },
          {
            type: "math-block",
            latex:
              "\\mathrm{Map}_{\\mathcal{X}}(X, \\widehat{\\mathcal{S}}) \\simeq \\mathcal{X}_{/X}^{\\mathrm{small}}",
          },
          {
            type: "paragraph",
            text: "These two properties — descent and object classifiers — together characterize ∞-toposes among presentable (∞, 1)-categories, completing the circle of ideas connecting higher category theory to homotopy-coherent geometry.",
          },
        ],
      },
    ],
  },
];

export function getLessonById(id: string): Lesson | undefined {
  return LESSONS.find((l) => l.id === id);
}

export function getLessonIndex(id: string): number {
  return LESSONS.findIndex((l) => l.id === id);
}
