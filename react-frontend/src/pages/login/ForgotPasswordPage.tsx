import React, { useState, FormEvent } from 'react';
import {
    Box,
    Grid,
    Link,
    Container,
    FormHelperText,
    TextField,
    Typography,
} from '@mui/material';
import { LoadingButton } from '@mui/lab';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordPage: React.FC = () => {

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (event: FormEvent) => {
        console.log("You just hit submit")
        event.preventDefault();

        setMessage("");
        setLoading(true);

        const apiLink = "http://localhost:9000/api/password-reset-link"

        // Data to be sent in the request body
        const data = {
            email: email
        };

        // Request options
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        // Making the POST request
        fetch(apiLink, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Response:', data.message);
                // Handle response data here
                setLoading(false);
                setMessage(data.message);
            })
            .catch(error => {
                console.error('Error:', error.message);
                // Handle errors here
                setMessage(error.message);
            });
    };

    return (
        <Container maxWidth="xs">
            <Box sx={{display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 8,}}>
                <Typography component="h1" variant="h5"> Reset Password </Typography>
                <Box component="form" onSubmit={handleSubmit} mt={3}>
                    <TextField label="Email" margin="normal" required fullWidth autoComplete="email" onChange={(e) => setEmail(e.target.value)} value={email} autoFocus />
                    <LoadingButton type="submit" variant="contained" loading={loading} sx={{ mt: 4, mb: 3 }}>Submit</LoadingButton>
                    <FormHelperText>{message}</FormHelperText>
                </Box>
            </Box>
        </Container>
    );
};

export default ForgotPasswordPage;
