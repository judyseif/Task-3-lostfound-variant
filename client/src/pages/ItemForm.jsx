import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { api } from '../api'

const defaults = { title: '', description: '', category: 'other', status: 'lost', location: '' }
const statuses = ['lost', 'found', 'claimed']
const categories = ['electronics', 'clothing', 'documents', 'accessories', 'other']

export default function ItemForm() {
  const nav = useNavigate()
  const { id } = useParams()
  const [form, setForm] = useState(defaults)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(Boolean(id))

  useEffect(() => {
    if (!id) {
      setForm(defaults)
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)
    setError('')

    async function loadItem() {
      try {
        const res = await api.get(`/items/${id}`)
        if (cancelled) return
        const { title, status, category, location, description } = res.data.item
        setForm({ title, status, category, location: location || '', description: description || '' })
      } catch (err) {
        if (!cancelled) setError(err?.response?.data?.message || 'Failed to load item')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadItem()
    return () => { cancelled = true }
  }, [id])

  function onChange(e) {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        title: form.title,
        status: form.status,
        category: form.category,
        location: form.location,
        description: form.description
      }
      if (id) {
        await api.patch(`/items/${id}`, payload)
      } else {
        await api.post('/items', payload)
      }
      nav('/items')
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to save item')
    }
  }

  return (
    <div className="max-w-lg mx-auto card">
      <h1 className="text-xl font-semibold mb-4">{id ? 'Edit' : 'Report'} Item</h1>
      <form onSubmit={onSubmit} className="space-y-3">
        <label className="block space-y-1">
          <span className="text-sm font-medium">Title</span>
          <input
            className="input"
            name="title"
            value={form.title}
            onChange={onChange}
            placeholder="Black backpack"
            required
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Status</span>
          <select className="input" name="status" value={form.status} onChange={onChange}>
            {statuses.map(status => <option key={status} value={status}>{status}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Category</span>
          <select className="input" name="category" value={form.category} onChange={onChange}>
            {categories.map(category => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Location (optional)</span>
          <input
            className="input"
            name="location"
            value={form.location}
            onChange={onChange}
            placeholder="Library 2nd floor"
          />
        </label>
        <label className="block space-y-1">
          <span className="text-sm font-medium">Description (optional)</span>
          <textarea
            className="input"
            name="description"
            value={form.description}
            onChange={onChange}
            rows="4"
          />
        </label>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        <button className="btn" type="submit" disabled={loading}>
          {loading ? 'Loading…' : 'Save'}
        </button>
      </form>
    </div>
  )
}
