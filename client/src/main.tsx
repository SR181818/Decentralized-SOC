import { createRoot } from 'react-dom/client'
import { IotaClientProvider, WalletProvider } from "@iota/dapp-kit"
import { getFullnodeUrl } from "@iota/iota-sdk/client"
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import App from './App.tsx'
import './index.css'

// IOTA testnet configuration
const networks = {
  testnet: { url: getFullnodeUrl("testnet") }
}

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <IotaClientProvider networks={networks} defaultNetwork="testnet">
      <WalletProvider>
        <App />
      </WalletProvider>
    </IotaClientProvider>
  </QueryClientProvider>
)