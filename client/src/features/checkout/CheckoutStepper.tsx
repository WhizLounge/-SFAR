import { Box, Button, Checkbox, FormControlLabel, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { AddressElement, PaymentElement, useElements } from "@stripe/react-stripe-js";
import { useState } from "react";
import Review from "./Review";
import { useFetchAddressQuery, useUpdateUserAddressMutation } from "../account/accountApi";
import { Address } from "../../app/models/user";
import { StripeAddressElementChangeEvent, StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { useBasket } from "../../lib/hooks/useBasket";
import { currencyFormat } from "../../lib/util";

const steps = ['Address', 'Payment','Review'];
export default function CheckoutStepper() {
    const [activeStep, setActiveStep]= useState(0);
    const {data: {name, ...restAddress} = {} as Address, isLoading} = useFetchAddressQuery();
    const [updateAddress] = useUpdateUserAddressMutation();
    const [saveAddressChecked, setSaveAddressChecked] = useState(false);
    const elements = useElements();
    const [addressComplete, setAddressComplete] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const {total}= useBasket();

    const handleNext = async ()=> {
        if(activeStep === 0 && saveAddressChecked && elements){
            const address = await getStripeAddress();
            if(address) await updateAddress(address);
        }
        setActiveStep (step => step + 1);
    }
    const getStripeAddress = async () => {
        const addressElement = elements?.getElement('address');
        if(!addressElement) return null;
        const {value: {name, address}} = await addressElement.getValue();

        if(name && address) return {...address, name}
        return null;
    }

    const handleBack = ()=> {
        setActiveStep(step => step - 1);
    }

    const handleAddressChange = (event: StripeAddressElementChangeEvent) => {
        setAddressComplete(event.complete)
    }
    const handlePaymentChange = (event: StripePaymentElementChangeEvent) => {
        setPaymentComplete(event.complete)
    }

    if(isLoading) return <Typography variant="h6">Loading checkout...</Typography>
  return (
 <Paper sx={{p: 3, borderRadius: 3}}> 
 <Stepper activeStep={activeStep}>
    {steps.map((lable, index)=>{
        return(
            <Step key={index}>
                <StepLabel>{lable}</StepLabel>
            </Step>
        )
    })}
 </Stepper>
 <Box sx={{mt: 3}}>
    <Box sx={{display: activeStep === 0 ? 'block':'none'}}>
<AddressElement 
options={{
    mode:'shipping',
    defaultValues: {
        name: name,
        address: restAddress
       
    }
}}
onChange={handleAddressChange}
/>
<FormControlLabel sx={{display: 'flex', justifyContent: 'end'}}
control={<Checkbox
checked={saveAddressChecked}
onChange={e => setSaveAddressChecked(e.target.checked)}
/>}
label='Save as default address'
/>
    </Box>
    <Box sx={{display: activeStep === 1 ? 'block':'none'}}>
<PaymentElement onChange={handlePaymentChange}/>
    </Box>
    <Box sx={{display: activeStep === 2 ? 'block':'none'}}>
        <Review/>
    </Box>
 </Box>

 <Box display='flex' paddingTop={2} justifyContent='space-between'>
    <Button onClick={handleBack}>Back</Button>
    <Button 
    onClick={handleNext}
    disabled={
        (activeStep === 0 && !addressComplete) ||
        (activeStep === 1 && !paymentComplete) 
    }
    >
        {activeStep === steps.length - 1 ? `Pay ${currencyFormat(total)}` : 'Next'}
    </Button>
 </Box>

 </Paper>
)
}


