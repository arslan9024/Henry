/**
 * [Category 1: View]
 * White Caves Real Estate - Contract Parties Card (Landlord & Tenant)
 * Composes Landlord & Tenant details cards (< 35 lines, 0 inline CSS).
 */

import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updatePage1Field } from '../../store/tenancyStudioSlice';
import { LandlordDetailsCard } from './LandlordDetailsCard';
import { TenantDetailsCard } from './TenantDetailsCard';

export const PartiesCard = () => {
  const dispatch = useDispatch();
  const page1 = useSelector((state) => state.tenancyStudio.page1);

  const handleChange = (field, value) => {
    dispatch(updatePage1Field({ field, value }));
  };

  return (
    <>
      <LandlordDetailsCard page1={page1} onChange={handleChange} />
      <TenantDetailsCard page1={page1} onChange={handleChange} />
    </>
  );
};

export default PartiesCard;
