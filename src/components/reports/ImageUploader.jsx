import { handleReportImageError } from '../../assets/items'

function ImageUploader({ file, onFileChange, previewUrl, uploadProgress = 0, error, demoMode = false, category = '' }) {
  return (
    <div className="upload-box">
      {demoMode ? (
        <div className="form-field">
          <span>Demo item image</span>
          <p className="form-help">Using the predefined {category || 'campus item'} illustration for this category.</p>
          <p className="form-help">Demo mode uses a predefined local image. Student uploads are reserved for the future Firebase Storage mode.</p>
        </div>
      ) : (
        <label className="form-field">
          <span>Image</span>
          <input
            type="file"
            accept="image/*"
            onChange={(event) => onFileChange(event.target.files?.[0] || null)}
          />
          <p className="form-help">Images are uploaded through Firebase Storage when demo mode is disabled.</p>
        </label>
      )}

      {previewUrl && (
        <div className="image-preview-wrap">
          <img src={previewUrl} alt="Selected report item preview" className="image-preview" onError={(event) => handleReportImageError(event, category)} />
        </div>
      )}

      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="upload-progress">
          <div className="upload-progress-bar" style={{ width: `${uploadProgress}%` }} />
          <span>{Math.round(uploadProgress)}%</span>
        </div>
      )}

      {error && <p className="error-message">{error}</p>}
    </div>
  )
}

export default ImageUploader
