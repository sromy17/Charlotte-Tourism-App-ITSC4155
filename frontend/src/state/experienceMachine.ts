import { assign, createMachine } from 'xstate';

export type Phase = 'induction' | 'engine' | 'interface';

export interface SelectionPayload {
  arrival: string;
  persona: string;
  budget: number;
  hours: number;
  protocol: string;
}

export interface ExperienceContext {
  selections: SelectionPayload;
}

export type ExperienceEvent =
  | { type: 'NEXT' }
  | { type: 'BACK' }
  | { type: 'RESET' }
  | { type: 'SET_SELECTIONS'; payload: Partial<SelectionPayload> }
  | { type: 'GENERATE' };

const defaultSelections: SelectionPayload = {
  arrival: '',
  persona: '',
  budget: 500,
  hours: 24,
  protocol: 'Balanced',
};

export const experienceMachine = createMachine<ExperienceContext, ExperienceEvent>(
  {
  id: 'experience',
  initial: 'induction',
  context: {
    selections: defaultSelections,
  },
  states: {
    induction: {
      on: {
        SET_SELECTIONS: {
          actions: 'assignSelections',
        },
        GENERATE: {
          cond: 'canGenerate',
          target: 'engine',
        },
        NEXT: {
          target: 'engine',
        },
      },
    },
    engine: {
      on: {
        BACK: {
          target: 'induction',
        },
        NEXT: {
          target: 'interface',
        },
      },
    },
    interface: {
      on: {
        BACK: {
          target: 'induction',
        },
        RESET: {
          target: 'induction',
          actions: 'resetSelections',
        },
        SET_SELECTIONS: {
          actions: 'assignSelections',
        },
      },
    },
  },
  },
  {
    actions: {
      assignSelections: assign((context, event) => {
        if (event.type !== 'SET_SELECTIONS') {
          return {};
        }

        return {
          selections: {
            ...context.selections,
            ...event.payload,
          },
        };
      }),
      resetSelections: assign(() => ({
        selections: defaultSelections,
      })),
    },
    guards: {
      canGenerate: (context) => Boolean(context.selections.arrival && context.selections.persona),
    },
  },
);
