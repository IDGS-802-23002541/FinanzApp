import { Alert } from '@mui/material'

function TabPendiente({ titulo }) {
  return <Alert severity="info">{titulo}: en construcción.</Alert>
}

export default TabPendiente
