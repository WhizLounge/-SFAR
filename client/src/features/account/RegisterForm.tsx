import { useForm } from "react-hook-form";
import { useRegisterMutation } from "./accountApi";
import { zodResolver } from "@hookform/resolvers/zod";
import { RegisterSchema, registerSchema } from "../../lib/schemas/registerSchema";
import { LockOutlined } from "@mui/icons-material";
import { Container, Paper, Box, Typography, TextField, Button } from "@mui/material";
import { Link } from "react-router-dom";

export default function RegisterForm() {
    const [registerUser]= useRegisterMutation();
    const {register, handleSubmit,formState:{errors,isValid, isLoading}}= useForm<RegisterSchema>(
        {
            mode: 'onTouched',
            resolver: zodResolver(registerSchema)
        }
    )
    const onSubmit = async(data: RegisterSchema)=>{
        await registerUser(data);
    }
  return (<Container component={Paper} maxWidth='sm' sx={{borderRadius: 3}}>
    <Box display='flex' flexDirection='column' alignItems='center' margin='8'>
       <LockOutlined sx={{mt:3, color:'secondary.main', fontSize: 40}}/>
       <Typography variant="h5">
          Register

       </Typography>

       <Box component='form'
       onSubmit={handleSubmit(onSubmit)}
       width='100'
       display='flex'
       flexDirection='column'
       gap={3}
       margin={3}>
           <TextField
           
           fullWidth
           label='Email'
           autoFocus
           {...register('email')}
           error={!!errors.email}
           helperText={errors.email?.message}/>
           
           <TextField
           fullWidth
           label='Password'
           type="password"
           {...register('password')}
           error={!!errors.password}
           helperText={errors.password?.message}/>

           <Button disabled={isLoading || !isValid} variant="contained" type="submit">
              Register

           </Button>
           <Typography sx={{textAlign:'center'}}>

             Already have an account?

               <Typography  sx={{ml:2 }} component={Link} to='/login' color='primary'>
               Sign in here

               </Typography>
           </Typography>

       </Box>
    </Box>



</Container>)
}
