import { Box, Stack } from '@mui/material'
import { Link } from 'react-router-dom'

function Landing() {
  return (
    <>
      <h1>FinanzApp</h1>
    
      <Link to='/login' style={{ textDecoration: 'none' }}>
          Login
      </Link>
    </>
  )

}

export default Landing
