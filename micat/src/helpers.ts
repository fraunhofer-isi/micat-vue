// © 2024 Fraunhofer-Gesellschaft e.V., München
//
// SPDX-License-Identifier: AGPL-3.0-or-later

export const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
})
export const scientificFormatter = Intl.NumberFormat('en', {
    notation: 'scientific',
})
export const labelFormatter = Intl.NumberFormat('en', {
    notation: 'standard',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
})
