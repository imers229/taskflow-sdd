import { createApp } from './app.js';
import { getEnvironmentConfig } from './config/environment.js';

const configuration = getEnvironmentConfig();
const application = createApp(configuration.frontendOrigin);

application.listen(configuration.port, () => {
  console.log(`TaskFlow backend escuchando en el puerto ${configuration.port}`);
});
