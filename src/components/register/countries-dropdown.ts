import { supportedCountries } from "../../shared/supported-countries";

export function getSupportedCountriesHtml(): string {
  return `
        <select>
            ${supportedCountries.map((country) => `<option value="${country.code}">${country.name}</option>`).join("")}
        </select>
    `;
}
