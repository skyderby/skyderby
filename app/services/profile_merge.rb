class ProfileMerge
  class SuccessResult
    def success?
      true
    end
  end

  class ErrorResult
    def success?
      false
    end

    def errors
      []
    end
  end

  def initialize(source:, destination:)
    @source = source
    @destination = destination
  end

  def execute
    return ErrorResult.new if !source || !destination
    return ErrorResult.new if source == destination

    destination.transaction do
      if source.owner && source.belongs_to_user?
        destination.update_columns(owner_id: source.owner_id, owner_type: source.owner_type)
      end

      destination.country_id ||= source.country_id
      destination.userpic = source.userpic
      destination.save!

      collections = associations.keys.map { |association_name| source.public_send(association_name) }
      collections.each { |collection| update_elements(collection) }
    end

    SuccessResult.new
  end

  private

  def update_elements(collection)
    # update_columns on element using instead of update_all only because readonly?
    # should be checked
    collection.each do |elem|
      elem.update_columns(profile_id: destination.id) unless elem.readonly?
    end
  end

  def associations
    Profile.reflections.select do |_association_name, reflection|
      reflection.macro == :has_many
    end
  end

  attr_reader :source, :destination
end
