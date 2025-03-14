import { LightMode } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { DarkMode } from "@mui/icons-material";
 
type Props = {
    toggleDarkMode: () => void;
    darkMode: boolean;
}
export default function NavBar({darkMode,toggleDarkMode}: Props) {
    

   return (<AppBar position="fixed">
    <Toolbar>
        <Typography variant="h6"> SFAR-STORE
<IconButton onClick={toggleDarkMode}> 
    {darkMode ? <DarkMode sx={{color:'blue'}}/> : <LightMode sx={{color:'orange'}}/>}
</IconButton>
        </Typography>
    </Toolbar>

   </AppBar>
   )
 }
 