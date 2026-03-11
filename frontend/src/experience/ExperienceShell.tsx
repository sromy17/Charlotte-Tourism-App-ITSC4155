import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { interpret, InterpreterFrom } from 'xstate';
import { experienceMachine } from '../state/experienceMachine';
import { InductionLayer } from './layers/InductionLayer';
import { EngineLayer } from './layers/EngineLayer';
import { InterfaceLayer } from './layers/InterfaceLayer';
import { experienceService } from '../services/experienceService';
import { useExperienceStore } from '../state/experienceStore';

export const ExperienceShell: React.FC = () => {
  const [state, setState] = useState(experienceMachine.initialState);
  const serviceRef = useRef<InterpreterFrom<typeof experienceMachine> | null>(null);
  const {
    loading,
    error,
    setLoading,
    setError,
    setWeather,
    hydrateFromSuggestions,
  } = useExperienceStore();

  useEffect(() => {
    const service = interpret(experienceMachine);
    serviceRef.current = service;
    service.onTransition((nextState) => setState(nextState));
    service.start();

    return () => {
      service.stop();
      serviceRef.current = null;
    };
  }, []);

  const send = (event: Parameters<InterpreterFrom<typeof experienceMachine>['send']>[0]) => {
    serviceRef.current?.send(event);
  };

  const handleGenerate = async () => {
    send({ type: 'GENERATE' });
    setError(null);
    setLoading(true);

    try {
      const [items, weather] = await Promise.all([
        experienceService.generateSuggestions(state.context.selections),
        experienceService.getForecast(),
      ]);

      hydrateFromSuggestions(items);
      setWeather(weather);
      setTimeout(() => send({ type: 'NEXT' }), 1200);
    } catch (generationError) {
      setError('Generation stream interrupted. Check backend/API keys and retry.');
      console.error(generationError);
    } finally {
      setLoading(false);
    }
  };

  const worldTransform = useMemo(() => {
    if (state.matches('induction')) {
      return { x: '0%', y: '0%', rotate: 0 };
    }

    if (state.matches('engine')) {
      return { x: '12%', y: '-8%', rotate: 1.2 };
    }

    return { x: '-10%', y: '6%', rotate: -1.6 };
  }, [state]);

  return (
    <div className="relative h-[calc(100vh-72px)] min-h-[720px] overflow-hidden bg-[#020202] text-[#F9F8F3]">
      <motion.div
        animate={worldTransform}
        transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute -left-[20%] -top-[20%] h-[140%] w-[140%]"
      >
        <div
          className="absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,0.09) 0.5px, transparent 0.5px), linear-gradient(90deg, rgba(255,255,255,0.09) 0.5px, transparent 0.5px)',
            backgroundSize: '72px 72px',
          }}
        />
        <div className="absolute left-[18%] top-[18%] h-96 w-96 rounded-full bg-[#004D2C]/20 blur-[110px]" />
        <div className="absolute bottom-[14%] right-[20%] h-[420px] w-[420px] rounded-full bg-[#004D2C]/12 blur-[120px]" />
      </motion.div>

      <div className="relative z-10 h-full w-full p-6 sm:p-10">
        <AnimatePresence mode="wait">
          {state.matches('induction') && (
            <InductionLayer
              key="induction"
              selections={state.context.selections}
              onChange={(payload) => send({ type: 'SET_SELECTIONS', payload })}
              onGenerate={handleGenerate}
            />
          )}

          {state.matches('engine') && (
            <EngineLayer
              key="engine"
              selections={state.context.selections}
              loading={loading}
              error={error}
              onSkip={() => send({ type: 'NEXT' })}
              onRetry={handleGenerate}
            />
          )}

          {state.matches('interface') && (
            <InterfaceLayer
              key="interface"
              selections={state.context.selections}
              onReset={() => send({ type: 'RESET' })}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
