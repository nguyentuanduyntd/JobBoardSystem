const API_URL = 'http://127.0.0.1:8000'

export const getJobs = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/jobs/?${query}`)
    return response.json()
}
export const getJobDetail = async (id) => {
    const response = await fetch(`${API_URL}/jobs/${id}/`)
    return response.json()
}

export const getCompanies = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/companies/?${query}`)
    return response.json()
}

export const getJobCategories = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/jobcategories/?${query}`)
    return response.json()
}

export const getSkills = async (params = {}) => {
    const query = new URLSearchParams(params).toString()
    const response = await fetch(`${API_URL}/skills/?${query}`)
    return response.json()
}
