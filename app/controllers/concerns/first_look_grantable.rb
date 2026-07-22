module FirstLookGrantable
  extend ActiveSupport::Concern

  private

  def grant_first_look(track)
    return unless FreeProView.grant_first_look(user: current_user, track: track)

    flash[:first_look] = true
  end
end
