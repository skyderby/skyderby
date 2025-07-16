class Event::ReferencePoint < ApplicationRecord
  include CsvImportable

  belongs_to :event
  has_many :assignments, class_name: 'Event::ReferencePointAssignment', dependent: :restrict_with_error
  validate :restrict_update_if_assigned_to_competitors

  def restrict_update_if_assigned_to_competitors
    return if assignments.none?

    errors.add(:base, 'Cannot update reference point if it is assigned to competitors')
  end

  class << self
    def find_or_create(opts)
      params = opts.slice(:name, :latitude, :longitude)

      return if params[:name].blank? && (params[:latitude].blank? || params[:longitude].blank?)

      if params[:latitude].blank? || params[:longitude].blank?
        find_by(name: params[:name])
      else
        find_or_create_by(params)
      end
    end
  end
end
