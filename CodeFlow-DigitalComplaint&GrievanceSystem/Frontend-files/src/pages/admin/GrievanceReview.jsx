import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';

const GrievanceReview = () => {
    const { code } = useParams();
    const navigate = useNavigate();
    const [grievance, setGrievance] = useState(null);
    const [loading, setLoading] = useState(true);
    const [reviewForm, setReviewForm] = useState({
        status: 'Pending',
        priority: 'Normal',
        adminNotes: '',
        reviewComments: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        const fetchGrievance = async () => {
            setLoading(true);
            try {
                const found = await grievanceService.getGrievanceByCode(code);
                setGrievance(found);
                setReviewForm({
                    status: found.status || 'Pending',
                    priority: found.priority || 'Normal',
