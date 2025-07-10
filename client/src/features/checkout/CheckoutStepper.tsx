import { Box, Button, Checkbox, FormControlLabel, Paper, Step, StepLabel, Stepper, Typography } from "@mui/material";
import { AddressElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useState } from "react";
import Review from "./Review";
import { useFetchAddressQuery, useUpdateUserAddressMutation } from "../account/accountApi";

import { ConfirmationToken, StripeAddressElementChangeEvent, StripePaymentElementChangeEvent } from "@stripe/stripe-js";
import { useBasket } from "../../lib/hooks/useBasket";
import { currencyFormat } from "../../lib/util";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { LoadingButton } from "@mui/lab";

const steps = ['Address', 'Payment','Review'];
export default function CheckoutStepper() {
    const [activeStep, setActiveStep]= useState(0);
     const {basket} = useBasket();
// recieved Neil help from here 
    const {data, isLoading} = useFetchAddressQuery();         
 
let name, restAddress;    
if (data) {
   ({name, ...restAddress} = data);    
}

// recieved Neil help from here and above the comment

    const [updateAddress] = useUpdateUserAddressMutation();
    const [saveAddressChecked, setSaveAddressChecked] = useState(false);
    const elements = useElements();
    const strip = useStripe();
    const [addressComplete, setAddressComplete] = useState(false);
    const [paymentComplete, setPaymentComplete] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const {total, clearBasket}= useBasket();
    const navigate = useNavigate();
    const [confirmationToken,setConfirmationToken] = useState<ConfirmationToken| null>(null);

    const handleNext = async ()=> {
        if(activeStep === 0 && saveAddressChecked && elements){
            const address = await getStripeAddress();
            if(address) await updateAddress(address);
        }
        if(activeStep === 1){
            if(!elements || !strip) return; 
            const result = await elements.submit();
            if(result.error) return toast.error(result.error.message);  
            const stripResult = await strip.createConfirmationToken({elements});
            if(stripResult.error) return toast.error(stripResult.error.message);
            setConfirmationToken(stripResult.confirmationToken);
        }
        if(activeStep === 2) {
            await confirmpayment();
        }
        if(activeStep < 2) setActiveStep (step => step + 1);
    }
    const confirmpayment = async () => {
        setSubmitting(true);
        try {
            if(!confirmationToken || !basket?.clientSecret ) 
                throw new Error('Unable to process payment');

            const paymentResult = await strip?.confirmPayment({
                clientSecret: basket.clientSecret,
                redirect: 'if_required',
                confirmParams: {
                    confirmation_token: confirmationToken.id,
                }
            });

            if(paymentResult?.paymentIntent?.status === 'succeeded') {
                navigate('/checkout/success');
                clearBasket();
            } else if(paymentResult?.error) {
                throw new Error(paymentResult.error.message);
            } else {
                throw new Error('Payment failed');
            }
        } catch (error) {
            if(error instanceof Error) {
                toast.error(error.message);
            }
          setActiveStep(step => step - 1);
        } finally {
            setSubmitting(false);
        }
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
        <Review confirmationToken={confirmationToken}/>
    </Box>
 </Box>

 <Box display='flex' paddingTop={2} justifyContent='space-between'>
    <Button onClick={handleBack}>Back</Button>
    <LoadingButton 
    onClick={handleNext}
    disabled={
        (activeStep === 0 && !addressComplete) ||
        (activeStep === 1 && !paymentComplete) ||
        submitting
    }
    loading={submitting}
    >
        {activeStep === steps.length - 1 ? `Pay ${currencyFormat(total)}` : 'Next'}
    </LoadingButton>
 </Box>

 </Paper>
)
}


