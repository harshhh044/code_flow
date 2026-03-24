import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CATEGORIES, STORAGE_KEYS } from '../../utils/constants';
import { grievanceAPI } from '../../services/api'; // ✅ CHANGED


