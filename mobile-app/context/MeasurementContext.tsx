import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type MeasurementSystem = 'metric' | 'imperial';

interface MeasurementContextType {
    measurementSystem: MeasurementSystem;
    setMeasurementSystem: (system: MeasurementSystem) => Promise<void>;

    // Conversion utilities
    formatWeight: (value: number | undefined, fromUnit: 'kg' | 'lbs') => string;
    formatHeight: (value: number | undefined, fromUnit: 'cm' | 'ft') => string;
    convertWeight: (value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs') => number;
    convertHeight: (value: number, fromUnit: 'cm' | 'ft', toUnit: 'cm' | 'ft') => number;
    getWeightUnit: () => 'kg' | 'lbs';
    getHeightUnit: () => 'cm' | 'ft';
}

const MeasurementContext = createContext<MeasurementContextType | undefined>(undefined);

export const MeasurementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [measurementSystem, setMeasurementSystemState] = useState<MeasurementSystem>(
        user?.measurementSystem || 'metric'
    );

    // Sync with user profile
    useEffect(() => {
        if (user?.measurementSystem) {
            setMeasurementSystemState(user.measurementSystem);
        }
    }, [user?.measurementSystem]);

    const setMeasurementSystem = async (system: MeasurementSystem) => {
        setMeasurementSystemState(system);
        await updateUser({ measurementSystem: system });
    };

    // Conversion utilities
    const convertWeight = (value: number, fromUnit: 'kg' | 'lbs', toUnit: 'kg' | 'lbs'): number => {
        if (fromUnit === toUnit) return value;
        if (fromUnit === 'kg' && toUnit === 'lbs') {
            return value * 2.20462;
        }
        if (fromUnit === 'lbs' && toUnit === 'kg') {
            return value / 2.20462;
        }
        return value;
    };

    const convertHeight = (value: number, fromUnit: 'cm' | 'ft', toUnit: 'cm' | 'ft'): number => {
        if (fromUnit === toUnit) return value;
        if (fromUnit === 'cm' && toUnit === 'ft') {
            return value / 30.48; // Returns decimal feet (e.g., 5.9)
        }
        if (fromUnit === 'ft' && toUnit === 'cm') {
            return value * 30.48;
        }
        return value;
    };

    const getWeightUnit = (): 'kg' | 'lbs' => {
        return measurementSystem === 'metric' ? 'kg' : 'lbs';
    };

    const getHeightUnit = (): 'cm' | 'ft' => {
        return measurementSystem === 'metric' ? 'cm' : 'ft';
    };

    const formatWeight = (value: number | undefined, fromUnit: 'kg' | 'lbs'): string => {
        if (!value) return '--';

        const targetUnit = getWeightUnit();
        const convertedValue = convertWeight(value, fromUnit, targetUnit);

        return `${Math.round(convertedValue)} ${targetUnit}`;
    };

    const formatHeight = (value: number | undefined, fromUnit: 'cm' | 'ft'): string => {
        if (!value) return '--';

        const targetUnit = getHeightUnit();
        const convertedValue = convertHeight(value, fromUnit, targetUnit);

        if (targetUnit === 'ft') {
            const ft = Math.floor(convertedValue);
            const inches = Math.round((convertedValue - ft) * 12);
            return `${ft}'${inches}"`;
        }

        return `${Math.round(convertedValue)} cm`;
    };

    return (
        <MeasurementContext.Provider
            value={{
                measurementSystem,
                setMeasurementSystem,
                formatWeight,
                formatHeight,
                convertWeight,
                convertHeight,
                getWeightUnit,
                getHeightUnit,
            }}
        >
            {children}
        </MeasurementContext.Provider>
    );
};

export const useMeasurement = () => {
    const context = useContext(MeasurementContext);
    if (!context) {
        throw new Error('useMeasurement must be used within a MeasurementProvider');
    }
    return context;
};
