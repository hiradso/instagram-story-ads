import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CampaignsListPage } from './pages/advertiser/CampaignsListPage'
import { CampaignFormPage } from './pages/advertiser/CampaignFormPage'
import { CampaignDetailPage } from './pages/advertiser/CampaignDetailPage'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['advertiser']} />}>
        <Route path="/advertiser/campaigns" element={<CampaignsListPage />} />
        <Route path="/advertiser/campaigns/new" element={<CampaignFormPage />} />
        <Route path="/advertiser/campaigns/:id" element={<CampaignDetailPage />} />
        <Route path="/advertiser/campaigns/:id/edit" element={<CampaignFormPage />} />
      </Route>
    </Routes>
  )
}

export default App
