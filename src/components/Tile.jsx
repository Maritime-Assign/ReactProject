// tile component which takes in props as parameter (data)

import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import supabase from '../supabaseClient'

const Tile = ({ job, onJobUpdate }) => {
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState({ ...job })
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState(null)

    const statusColor = formData.open ? 'bg-green-600' : 'bg-red-600'

    const boxStyle = () =>
        'bg-mebablue-light px-3 py-1 rounded-md font-medium text-white font-mont'

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSave = async () => {
        setSaving(true)
        setError(null)
        try {
            const { data, error } = await supabase
                .from('Jobs')
                .update(formData)
                .eq('id', job.id)
                .select()

            if (error) throw error

            if (data && data.length > 0) {
                onJobUpdate(data[0])
                setIsEditing(false)
            }
        } catch (err) {
            console.error('Error saving job: err.message')
            setError(err.message)
        } finally {
            setSaving(false)
        }
    }



/*     const navigate = useNavigate()

    const handleEdit = () => {
        navigate('/editjob', {
            state: { jobData: props }, // Pass the specific job data
        })
    } */

    
return (
    <div className="flex flex-col bg-mebablue-hover w-full h-full rounded-md">
      {/* top bar */}
      <div className="bg-mebablue-dark w-full h-8 flex rounded-t-md justify-end gap-2 px-2">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-500 rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-green-600 font-mont"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-gray-500 font-mont"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-mebablue-light rounded-md text-sm my-auto px-2 text-white font-medium hover:bg-mebablue-hover font-mont"
          >
            Edit
          </button>
        )}
      </div>

      {/* content */}
      <div className="flex flex-col w-full h-full px-2 justify-center">
        {/* Row 1 */}
        <div className="grid grid-cols-3 gap-2 py-2 font-medium text-white font-mont">
          {isEditing ? (
            <>
              <input
                name="shipName"
                value={formData.shipName}
                onChange={handleChange}
                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
              />
              <input
                name="branch1"
                value={formData.branch1}
                onChange={handleChange}
                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
              />
              <input
                name="branch2"
                value={formData.branch2}
                onChange={handleChange}
                className="bg-mebablue-light px-2 py-1 rounded-md text-center"
              />
            </>
          ) : (
            <>
              <span className="bg-mebablue-light rounded-md px-2 py-1 text-center">
                {job.shipName}
              </span>
              <span className="bg-mebablue-light px-2 py-1 rounded-md text-center">
                {job.branch1} | {job.branch2}
              </span>
              <span
                className={`${statusColor} px-2 py-1 rounded-md text-white text-center`}
              >
                {job.open ? 'Open' : `Filled ${job.fillDate || ''}`}
              </span>
            </>
          )}
        </div>

        {/* Row 2: Notes */}
        <div className="bg-mebablue-light rounded-md py-2 px-4 text-sm font-medium flex-col flex text-white">
          <span className="font-medium font-mont">Requirements/Notes:</span>
          {isEditing ? (
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={2}
              className="bg-mebablue-light py-1 rounded-md text-white outline-none w-full"
            />
          ) : (
            <span className="font-mont">- {job.notes}</span>
          )}
        </div>

        {/* Row 3: Details */}
        <div className="grid grid-cols-4 gap-2 font-medium text-sm py-2">
          <div className={`${boxStyle()} col-span-2`}>
            {isEditing ? (
    <input
      name="location"
      value={formData.location}
      onChange={handleChange}
      className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
    />
  ) : (
    <>Location: {job.location}</>
  )}
          </div>
          <div className={`${boxStyle()} col-span-2`}>
            {isEditing ? (
    <input
      name="days"
      value={formData.days}
      onChange={handleChange}
      className="bg-mebablue-light px-2 py-1 rounded-md text-white w-full"
    />
  ) : (
    <>Location: {job.location}</>
  )}
            </div>
          <div className={`${boxStyle()} col-span-2`}>
            Date Called: {job.dateCalled}
          </div>
          <div className={`${boxStyle()} col-span-2`}>
            Join Date: {job.joinDate}
          </div>
          <div className={`${boxStyle()} col-span-2`}>
            Company: {job.company}
          </div>
          <div className={`${boxStyle()} col-span-1`}>
            Billet: {job.billet}
          </div>
          <div className={`${boxStyle()} col-span-1`}>
            Type: {job.type}
          </div>
          <div className={`${boxStyle()} col-span-4`}>
            Crew Relieved: {job.crewRelieved}
          </div>
        </div>
      </div>

      {error && (
        <div className="text-red-500 text-sm px-2 pb-2">Error: {error}</div>
      )}
    </div>
  )
}

export default Tile
