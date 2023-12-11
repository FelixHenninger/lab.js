/**
 * Summarize the position of an individual component in the study.
 *
 * As an example, a `componentSummary` might look like this:
 *
 * ```
 * [["1", "1_0", "1_0_0"], "Trial", "flow.Sequence"]
 * ```
 *
 * The first element of the array is an array of component ids,
 * starting from the root component and continuing down to the
 * component in question.
 *
 * The second element contains the component title.
 *
 * The third element represents the component type.
 */
export type componentSummary = [string[], string, string]

/**
 * Summaries of all sibling components at a specific level
 *
 * Contains `componentSummary` entries of all adjacent components. For example,
 * in a Stroop task, the first level might look like this:
 *
 * ```
 * [
 *   [["0"],"Instruction","html.Screen"],
 *   [["1"],"Practice frame","canvas.Frame"],
 *   [["2"],"Task frame","canvas.Frame"],
 *   [["3"],"Thanks","html.Screen"]
 * ],
 * ```
 */
type levelSummary = componentSummary[]

/**
 * Represent the current study stack, with adjacent components at all levels
 *
 * This represents the components that can currently be reached through jumping.
 * In a Stroop task, during the first trial of the practice phase,
 * the different levels of the current stack might be represented as follows,
 * starting from the topmost and most general level and continuing to the
 * most specific:
 *
 * ```
 * [
 *   [
 *     [["0"], "Instruction", "html.Screen"],
 *     [["1"], "Practice frame", "canvas.Frame"],
 *     [["2"], "Task frame", "canvas.Frame"],
 *     [["3"], "Thanks", "html.Screen"]
 *   ],
 *   [
 *     [["1", "1_0"], "Practice task", "flow.Loop"]
 *   ],
 *   [
 *     [["1", "1_0", "1_0_0"], "Trial", "flow.Sequence"],
 *     [["1", "1_0", "1_0_1"], "Trial", "flow.Sequence"],
 *     [["1", "1_0", "1_0_2"], "Trial", "flow.Sequence"],
 *     [["1", "1_0", "1_0_3"], "Trial", "flow.Sequence"]
 *   ],
 *   [
 *     [["1", "1_0", "1_0_0", "1_0_0_0"], "Fixation cross", "canvas.Screen"],
 *     [["1", "1_0", "1_0_0", "1_0_0_1"], "Stroop screen", "canvas.Screen"],
 *     [["1", "1_0", "1_0_0", "1_0_0_2"], "Inter-trial interval", "canvas.Screen"]
 *   ]
 * ]
 * ```
 */
export type stackSummary = levelSummary[]

/**
 * Custom iterator type implemented by `lab.js` flow control components
 *
 * Those `lab.js` components that themselves expose nested components
 * do so by providing an iterator over those components. Any generic iterator
 * will do for this task, as long as the study proceeds linearly, forward
 * through components.
 *
 * If additional functionality is desired (specifically jumping and restarting),
 * this needs to be implemented in the iterator also, allowing it to
 * fast-forward through the available components, or start over (or both
 * in sequence). These additional interfaces are summarized in the
 * `CustomIterator`.
 */
export type CustomIterator<T, TReturn = any, TNext = undefined> = {
  peek: () => levelSummary
  reset: () => void
} & Iterator<T, TReturn, TNext>
