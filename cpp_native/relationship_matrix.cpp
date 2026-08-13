/**
 * relationship_matrix.cpp - C++ Relationship Calculator with 50+ Detailed Relationship Types
 */

#include <unordered_map>
#include <string>
#include <vector>

namespace NativeSim {

struct DetailedRelationship {
    int residentA;
    int residentB;
    float friendship; // 0 to 100
    float romance;    // 0 to 100
    std::string status;
    std::string customTitle; // Over 50 unique relationship labels!

    DetailedRelationship() : residentA(0), residentB(0), friendship(25.0f), romance(0.0f), status("friend"), customTitle("ご近所さん") {}
};

class RelationshipMatrix50 {
private:
    std::unordered_map<std::string, DetailedRelationship> matrix;
    std::vector<std::string> all50Titles;

public:
    RelationshipMatrix50() {
        all50Titles = {
            "彼氏", "彼女", "夫", "妻", "婚約者", "最愛の人", "人生の伴侶",
            "片思い中", "両思い(秘密)", "元カレ", "元カノ", "元夫", "元妻",
            "大親友", "親友", "幼馴染", "腐れ縁", "心の友", "悪友", "趣味の仲間",
            "飲み友達", "ルームメイト", "信頼できる味方", "秘密の共有者", "喧嘩中",
            "恋のライバル", "宿敵", "気まずい関係", "仲直りしたい人", "探り合い中",
            "赤の他人", "ご近所さん", "同僚", "先輩", "後輩", "相棒", "師匠",
            "弟子", "憧れの人", "命の恩人", "秘密のパートナー", "お世話係",
            "頼れる兄貴分", "可愛い妹分", "腐れ縁の悪友", "意気投合した仲間",
            "気のおけない友人", "似たもの同士", "運命のライバル", "一方的な片思い", "密かな想い人"
        };
    }

    std::string calculateTitle(float friendship, float romance, bool married, bool isCouple, bool isQuarreling) {
        if (married) return "💍 夫婦 (人生の伴侶)";
        if (isCouple) return "💕 恋人 (彼氏/彼女)";
        if (isQuarreling) return "😡 喧嘩中 (気まずい関係)";

        if (romance >= 70) return "💘 一方的な片思い中";
        if (romance >= 50) return "💓 密かな想い人";
        if (friendship >= 90) return "✨ 大親友 (心の友)";
        if (friendship >= 75) return "🤝 親友 (信頼できる味方)";
        if (friendship >= 60) return "☕ 趣味の仲間 (悪友)";
        if (friendship >= 40) return "🏠 ルームメイト (ご近所さん)";
        return "🌱 赤の他人 (同僚)";
    }
};

} // namespace NativeSim
