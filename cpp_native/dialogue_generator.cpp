/**
 * dialogue_generator.cpp - C++ Tomodachi Life Dialogue Generator
 */

#include <vector>
#include <string>
#include <cstdlib>

namespace NativeSim {

class DialogueGenerator {
private:
    std::vector<std::string> casualDialogues;

public:
    DialogueGenerator() {
        casualDialogues = {
            "なんかお腹すいたな…ラーメン食べたいな！",
            "今日夢で空飛ぶパンダとダンスしたんだ！",
            "好きな食べ物は最初に食べて幸せになる派！",
            "時々宇宙の端っこのこと考えちゃうよね"
        };
    }

    std::string getRandomDialogue() {
        if (casualDialogues.empty()) return "...";
        int idx = std::rand() % casualDialogues.size();
        return casualDialogues[idx];
    }
};

} // namespace NativeSim
