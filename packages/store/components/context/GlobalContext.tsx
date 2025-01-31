import useConfig from 'hooks/useConfig';
import { createContext, useContext, useEffect, useState } from 'react';

interface iGlobalConfig {
  config: {
    [key: string]: any;
  };
  setConfig: (config: { [key: string]: any }) => void;
}

const GlobalContext = createContext<iGlobalConfig>({} as iGlobalConfig);

/**
 * @description GlobalProvider is a context provider that wraps the entire application.
 * */
export const GlobalProvider = (props) => {
  const [config, setConfig] = useState(props.initConfig);

  const { data } = useConfig();

  useEffect(() => {
    setConfig(data);
  }, [data]);

  return (
    <GlobalContext.Provider value={{ config, setConfig }}>
      {props.children}
    </GlobalContext.Provider>
  );
};

export const useGlobalConfig = () => useContext(GlobalContext);
