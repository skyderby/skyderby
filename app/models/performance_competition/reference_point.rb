class PerformanceCompetition::ReferencePoint < ApplicationRecord
  self.table_name = 'event_reference_points'

  belongs_to :event, class_name: 'PerformanceCompetition'

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
