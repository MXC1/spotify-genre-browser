import React from 'react';
import ModalContainer from '../../containers/modalContainer/modalContainer';
import './SortAndFilterModal.css';

function SortAndFilterModal({ 
    isOpen, 
    onClose, 
    sortOptions, 
    selectedSortOption, 
    onSortOptionChange, 
    onFilterStringChange,
    filterStrings = []
}) {
    const [selectedTag, setSelectedTag] = React.useState(null);


    const handleSortChange = (event) => {
        onSortOptionChange(event.target.value);
    };

    const handleTagClick = (tag) => {
        const newTag = selectedTag === tag ? null : tag;
        setSelectedTag(newTag);
        if (onFilterStringChange) {
            onFilterStringChange(newTag || '');
        }
    };    // Memoize the stop words set
    const stopWords = React.useMemo(() => new Set([
        'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have',
        'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you',
        'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they',
        'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one',
        'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out',
        'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when',
        'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know',
        'take', 'people', 'into', 'year', 'your', 'good', 'some',
        'could', 'them', 'see', 'other', 'than', 'then', 'now',
        'look', 'only', 'come', 'its', 'over', 'think', 'also',
        'back', 'after', 'use', 'two', 'how', 'our', 'work',
        'first', 'well', 'way', 'even', 'want', 'because',
        'any', 'these', 'give', 'day', 'most', 'us', 'don\'t', 'is'
    ]), []);

    // Function to count occurrences
    const countOccurrences = (arr) => {
        return arr.reduce((acc, curr) => {
            acc[curr] = (acc[curr] || 0) + 1;
            return acc;
        }, {});
    };    // Get common phrases and words
    const commonPhrases = React.useMemo(() => {
        // Function to generate n-grams from a string
        const generateNGrams = (str, n) => {
            const words = str.toLowerCase()
                .split(/[\s-]+/)
                .filter(word => !stopWords.has(word) && word.length > 1);
            
            const ngrams = [];
            for (let i = 0; i <= words.length - n; i++) {
                const phrase = words.slice(i, i + n).join(' ');
                // Only add phrase if it doesn't start or end with a stop word
                const phraseWords = phrase.split(' ');
                if (!stopWords.has(phraseWords[0]) && !stopWords.has(phraseWords[phraseWords.length - 1])) {
                    ngrams.push(phrase);
                }
            }
            return ngrams;
        };

        // Process all strings
        const allWords = [];
        const bigrams = [];
        const trigrams = [];

        filterStrings.forEach(str => {
            // Split into words and filter out stop words and single characters
            const words = str.toLowerCase()
                .split(/[\s-]+/)
                .filter(word => !stopWords.has(word) && word.length > 1);
            
            allWords.push(...words);
            
            // Generate n-grams
            if (words.length >= 2) bigrams.push(...generateNGrams(str, 2));
            if (words.length >= 3) trigrams.push(...generateNGrams(str, 3));
        });

        // Count occurrences
        const wordCounts = countOccurrences(allWords);
        const bigramCounts = countOccurrences(bigrams);
        const trigramCounts = countOccurrences(trigrams);

        // Combine and sort all counts
        const allPhrases = [
            ...Object.entries(wordCounts),
            ...Object.entries(bigramCounts),
            ...Object.entries(trigramCounts)
        ]
        .filter(([phrase, count]) => {
            // Only keep phrases that appear more than once and don't contain stop words
            return count > 1 && !phrase.split(' ').some(word => stopWords.has(word));
        })
        .sort((a, b) => b[1] - a[1]) // Sort by count
        .slice(0, 20) // Take top 20
        .map(([phrase]) => phrase);

        return allPhrases;
    }, [filterStrings, stopWords]);

    return (
        <ModalContainer
            isOpen={isOpen}
            onClose={onClose}
            title="Sort & Filter"
            description=""
            button1Text="Apply"
            button1Action={onClose}
        >
            <div className="sort-filter-content">
                <div className="word-cloud">
                    {commonPhrases.map((tag) => (
                        <button
                            key={tag}
                            className={`tag ${selectedTag === tag ? 'selected' : ''}`}
                            onClick={() => handleTagClick(tag)}
                        >
                            {tag}
                        </button>
                    ))}
                </div>
                <hr />
                <div className="sort-options">
                    <h3>Sort by</h3>
                    {sortOptions && sortOptions.map((option) => (
                        <label key={option.value} className="sort-option">
                            <input
                                type="radio"
                                name="sort"
                                value={option.value}
                                checked={selectedSortOption === option.value}
                                onChange={handleSortChange}
                            />
                            <span>{option.label}</span>
                        </label>
                    ))}
                </div>
            </div>
        </ModalContainer>
    );
}

export default SortAndFilterModal;