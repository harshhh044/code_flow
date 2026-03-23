import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const GrievanceForm = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1=form, 2=review, 3=success
    const [isAnonymous, setIsAnonymous] = useState(false);
    );
};

export default GrievanceForm;
