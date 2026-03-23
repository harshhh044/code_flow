import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES } from '../../utils/constants';
import grievanceService from '../../services/grievanceService';
