'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from './select';

export interface CountryCode {
    code: string;
    name: string;
    dialCode: string;
    flag: string;
}

// Common country codes - India first as default
export const COUNTRY_CODES: CountryCode[] = [
    { code: 'IN', name: 'India', dialCode: '+91', flag: '🇮🇳' },
    { code: 'US', name: 'United States', dialCode: '+1', flag: '🇺🇸' },
    { code: 'GB', name: 'United Kingdom', dialCode: '+44', flag: '🇬🇧' },
    { code: 'CA', name: 'Canada', dialCode: '+1', flag: '🇨🇦' },
    { code: 'AU', name: 'Australia', dialCode: '+61', flag: '🇦🇺' },
    { code: 'DE', name: 'Germany', dialCode: '+49', flag: '🇩🇪' },
    { code: 'FR', name: 'France', dialCode: '+33', flag: '🇫🇷' },
    { code: 'IT', name: 'Italy', dialCode: '+39', flag: '🇮🇹' },
    { code: 'ES', name: 'Spain', dialCode: '+34', flag: '🇪🇸' },
    { code: 'BR', name: 'Brazil', dialCode: '+55', flag: '🇧🇷' },
    { code: 'JP', name: 'Japan', dialCode: '+81', flag: '🇯🇵' },
    { code: 'CN', name: 'China', dialCode: '+86', flag: '🇨🇳' },
    { code: 'KR', name: 'South Korea', dialCode: '+82', flag: '🇰🇷' },
    { code: 'SG', name: 'Singapore', dialCode: '+65', flag: '🇸🇬' },
    { code: 'AE', name: 'UAE', dialCode: '+971', flag: '🇦🇪' },
    { code: 'SA', name: 'Saudi Arabia', dialCode: '+966', flag: '🇸🇦' },
    { code: 'ZA', name: 'South Africa', dialCode: '+27', flag: '🇿🇦' },
    { code: 'NZ', name: 'New Zealand', dialCode: '+64', flag: '🇳🇿' },
    { code: 'MX', name: 'Mexico', dialCode: '+52', flag: '🇲🇽' },
    { code: 'RU', name: 'Russia', dialCode: '+7', flag: '🇷🇺' },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
    id?: string;
}

export function PhoneInput({
    value,
    onChange,
    disabled = false,
    placeholder = 'Phone number',
    className,
    id,
}: PhoneInputProps) {
    // Parse existing value to extract country code and number
    const parsePhoneValue = (val: string): { countryCode: string; number: string } => {
        if (!val) return { countryCode: 'IN', number: '' };

        // Try to match a country code from the value
        for (const country of COUNTRY_CODES) {
            if (val.startsWith(country.dialCode)) {
                return {
                    countryCode: country.code,
                    number: val.slice(country.dialCode.length).trim(),
                };
            }
        }

        // Default to India if no country code found
        return { countryCode: 'IN', number: val.replace(/^\+\d+\s*/, '') };
    };

    const { countryCode: initialCountryCode, number: initialNumber } = parsePhoneValue(value);
    const [selectedCountry, setSelectedCountry] = React.useState(initialCountryCode);
    const [phoneNumber, setPhoneNumber] = React.useState(initialNumber);

    // Update internal state when external value changes
    React.useEffect(() => {
        const { countryCode, number } = parsePhoneValue(value);
        setSelectedCountry(countryCode);
        setPhoneNumber(number);
    }, [value]);

    const handleCountryChange = (countryCode: string) => {
        setSelectedCountry(countryCode);
        const country = COUNTRY_CODES.find((c) => c.code === countryCode);
        if (country && phoneNumber) {
            onChange(`${country.dialCode} ${phoneNumber}`);
        }
    };

    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newNumber = e.target.value;
        setPhoneNumber(newNumber);
        const country = COUNTRY_CODES.find((c) => c.code === selectedCountry);
        if (country) {
            if (newNumber) {
                onChange(`${country.dialCode} ${newNumber}`);
            } else {
                onChange('');
            }
        }
    };

    const selectedCountryData = COUNTRY_CODES.find((c) => c.code === selectedCountry);

    return (
        <div className={cn('flex gap-2', className)}>
            <Select
                value={selectedCountry}
                onValueChange={handleCountryChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-[110px] flex-shrink-0">
                    <SelectValue>
                        {selectedCountryData && (
                            <span className="flex items-center gap-1.5">
                                <span>{selectedCountryData.flag}</span>
                                <span className="text-muted-foreground">{selectedCountryData.dialCode}</span>
                            </span>
                        )}
                    </SelectValue>
                </SelectTrigger>
                <SelectContent>
                    {COUNTRY_CODES.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                            <span className="flex items-center gap-2">
                                <span>{country.flag}</span>
                                <span>{country.name}</span>
                                <span className="text-muted-foreground">{country.dialCode}</span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                id={id}
                type="tel"
                value={phoneNumber}
                onChange={handlePhoneChange}
                placeholder={placeholder}
                disabled={disabled}
                className="flex-1"
            />
        </div>
    );
}
