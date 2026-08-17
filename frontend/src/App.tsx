import { Route, Routes } from 'react-router-dom'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { Dashboard } from './pages/Dashboard'
import { ProtectedRoute } from './components/ProtectedRoute'
import { CampaignsListPage } from './pages/advertiser/CampaignsListPage'
import { CampaignFormPage } from './pages/advertiser/CampaignFormPage'
import { CampaignDetailPage } from './pages/advertiser/CampaignDetailPage'
import { ProfilePage } from './pages/ambassador/ProfilePage'
import { AssignmentsPage } from './pages/ambassador/AssignmentsPage'
import { SubmissionsPage } from './pages/admin/SubmissionsPage'
import { AdminCampaignsPage } from './pages/admin/CampaignsPage'
import { ProfilesPage } from './pages/admin/ProfilesPage'

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

      <Route element={<ProtectedRoute allowedRoles={['ambassador']} />}>
        <Route path="/ambassador/profile" element={<ProfilePage />} />
        <Route path="/ambassador/assignments" element={<AssignmentsPage />} />
      </Route>

      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route path="/admin/submissions" element={<SubmissionsPage />} />
        <Route path="/admin/campaigns" element={<AdminCampaignsPage />} />
        <Route path="/admin/profiles" element={<ProfilesPage />} />
      </Route>
    </Routes>
  )
}

export default App
