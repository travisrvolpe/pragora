# services/analysis/community_feedback_aggregator.py
from sqlalchemy.orm import Session
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.datamodels.user_datamodels import User, UserProfile
from app.datamodels.interaction_datamodels import PostInteraction


class CommunityNote:
    def __init__(self, note_id: int, user_id: int, content: str, created_at: datetime,
                 up_votes: int, down_votes: int, status: str):
        self.note_id = note_id
        self.user_id = user_id
        self.content = content
        self.created_at = created_at
        self.up_votes = up_votes
        self.down_votes = down_votes
        self.status = status


class CommunityFeedbackAggregator:
    def __init__(self, db: Session):
        self.db = db

    async def analyze(self, post_id: int) -> Dict[str, Any]:
        """
        Aggregate community feedback for a post
        Similar to Twitter/X's Community Notes
        """
        # Get all community notes for this post
        notes = self._get_community_notes(post_id)

        # Get votes on these notes
        note_votes = self._get_note_votes(notes)

        # Calculate influence scores for each note contributor
        contributor_scores = self._calculate_contributor_scores(notes)

        # Calculate agreement scores for each note
        agreement_scores = self._calculate_agreement_scores(notes, note_votes)

        # Select helpful notes based on agreement and contributor scores
        helpful_notes = self._select_helpful_notes(notes, agreement_scores, contributor_scores)

        # Calculate overall community assessment
        overall_assessment = self._calculate_overall_assessment(helpful_notes)

        return {
            "community_feedback_score": overall_assessment.get("community_score", 0.5),
            "helpful_notes": [
                {
                    "note_id": note.note_id,
                    "content": note.content,
                    "agreement_score": agreement_scores.get(note.note_id, 0.0),
                    "helpfulness_rating": overall_assessment.get("note_ratings", {}).get(note.note_id, 0.0)
                }
                for note in helpful_notes
            ],
            "vote_summary": {
                "total_votes": sum([note.up_votes + note.down_votes for note in notes]),
                "net_score": sum([note.up_votes - note.down_votes for note in notes])
            },
            "consensus_level": overall_assessment.get("consensus_level", 0.0),
            "confidence": overall_assessment.get("confidence", 0.0)
        }

    def _get_community_notes(self, post_id: int) -> List[CommunityNote]:
        """Get all community notes for a post"""
        # This would connect to your database model for community notes
        # Placeholder implementation
        notes = []

        # Example query - modify based on your actual schema
        # notes_data = self.db.query(CommunityNoteModel).filter(
        #     CommunityNoteModel.post_id == post_id,
        #     CommunityNoteModel.status == 'active'
        # ).all()

        # For demo purposes, returning empty list
        # In real implementation, would convert database results to CommunityNote objects
        return notes

    def _get_note_votes(self, notes: List[CommunityNote]) -> Dict[int, Dict[str, Any]]:
        """Get votes for each note"""
        note_votes = {}

        for note in notes:
            # Example query - modify based on your schema
            # votes = self.db.query(NoteVoteModel).filter(
            #     NoteVoteModel.note_id == note.note_id
            # ).all()

            # For demo purposes
            note_votes[note.note_id] = {
                "up_votes": note.up_votes,
                "down_votes": note.down_votes,
                "vote_distribution": {}  # Would contain vote breakdown by user groups
            }

        return note_votes

    def _calculate_contributor_scores(self, notes: List[CommunityNote]) -> Dict[int, float]:
        """Calculate influence scores for note contributors based on reputation"""
        contributor_scores = {}

        for note in notes:
            # Get contributor's profile data
            user = self.db.query(User).options(
                joinedload(User.profile)
            ).filter(User.user_id == note.user_id).first()

            if user and user.profile:
                # Base score on reputation
                reputation = user.profile.reputation_score

                # Could add other factors like:
                # - Previous note accuracy
                # - Domain expertise
                # - Account age

                contributor_scores[note.user_id] = min(1.0, max(0.1, reputation / 100.0))
            else:
                contributor_scores[note.user_id] = 0.5  # Default score

        return contributor_scores

    def _calculate_agreement_scores(self, notes: List[CommunityNote],
                                    note_votes: Dict[int, Dict[str, Any]]) -> Dict[int, float]:
        """Calculate agreement scores for each note based on votes"""
        agreement_scores = {}

        for note in notes:
            votes = note_votes.get(note.note_id, {})
            up_votes = votes.get("up_votes", 0)
            down_votes = votes.get("down_votes", 0)

            if up_votes + down_votes == 0:
                agreement_scores[note.note_id] = 0.5  # No votes
            else:
                # Calculate score weighted by vote count
                agreement_scores[note.note_id] = up_votes / (up_votes + down_votes)

                # Could add weight based on voter diversity
                # voter_diversity = votes.get("vote_distribution", {}).get("diversity_score", 0.5)
                # agreement_scores[note.note_id] *= (0.5 + 0.5 * voter_diversity)

        return agreement_scores

    def _select_helpful_notes(self, notes: List[CommunityNote],
                              agreement_scores: Dict[int, float],
                              contributor_scores: Dict[int, float]) -> List[CommunityNote]:
        """Select the most helpful notes based on agreement and contributor scores"""
        # Calculate combined score for each note
        note_scores = {}
        for note in notes:
            agreement = agreement_scores.get(note.note_id, 0.5)
            contributor = contributor_scores.get(note.user_id, 0.5)

            # Combined score - weights could be adjusted
            note_scores[note.note_id] = (agreement * 0.7) + (contributor * 0.3)

        # Select top notes (above threshold or top N)
        helpful_notes = []
        for note in notes:
            if note_scores.get(note.note_id, 0.0) > 0.6:  # Threshold
                helpful_notes.append(note)

        # Limit to top 3 notes if we have too many
        if len(helpful_notes) > 3:
            helpful_notes.sort(key=lambda x: note_scores.get(x.note_id, 0.0), reverse=True)
            helpful_notes = helpful_notes[:3]

        return helpful_notes

    def _calculate_overall_assessment(self, helpful_notes: List[CommunityNote]) -> Dict[str, Any]:
        """Calculate overall community assessment based on helpful notes"""
        if not helpful_notes:
            return {
                "community_score": 0.5,
                "note_ratings": {},
                "consensus_level": 0.0,
                "confidence": 0.0
            }

        # In a real implementation, would analyze note content and agreement patterns
        # For demo purposes, using simple metrics

        # Calculate ratings for each note
        note_ratings = {}
        for note in helpful_notes:
            # Rating based on vote ratio
            rating = note.up_votes / max(1, (note.up_votes + note.down_votes))
            note_ratings[note.note_id] = rating

        # Calculate consensus level (how much agreement exists between notes)
        consensus_level = 0.7  # Placeholder

        # Calculate overall community score
        avg_rating = sum(note_ratings.values()) / len(note_ratings)

        return {
            "community_score": avg_rating,
            "note_ratings": note_ratings,
            "consensus_level": consensus_level,
            "confidence": min(1.0, 0.3 + (0.7 * len(helpful_notes) / 5))  # More notes = higher confidence
        }