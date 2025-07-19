import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from "@tanstack/react-query"
import { createNetworkConfig, IotaClientProvider, WalletProvider } from "@iota/dapp-kit"
import '@iota/dapp-kit/dist/index.css'
import { getFullnodeUrl } from "@iota/iota-sdk/client"
import { queryClient } from "@/lib/queryClient"
import App from './App.tsx'
import './index.css'

// IOTA network configuration
const { networkConfig } = createNetworkConfig({
  testnet: { url: getFullnodeUrl("testnet") },
  devnet: { url: getFullnodeUrl("devnet") },
  localnet: { url: getFullnodeUrl("localnet") },
})

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <IotaClientProvider networks={networkConfig} defaultNetwork="testnet">
      <WalletProvider>
        <App />
      </WalletProvider>
    </IotaClientProvider>
  </QueryClientProvider>
)