module CompetitorAlias
  extend ActiveSupport::Concern

  included do
    belongs_to :competitor_alias,
               class_name: 'Profile::Alias',
               foreign_key: :alias_id,
               inverse_of: false,
               optional: true

    validate :alias_belongs_to_profile
  end

  def name = competitor_alias&.name.presence || profile&.name

  private

  def alias_belongs_to_profile
    return if competitor_alias.nil?
    return if competitor_alias.profile_id == profile_id

    errors.add(:alias_id, :invalid)
  end
end
